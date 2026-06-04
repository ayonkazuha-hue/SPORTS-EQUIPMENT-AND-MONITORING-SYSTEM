/**
 * API Database Layer
 * Replaces localStorage with real HTTP calls to the Express/Supabase backend.
 * All methods return Promises — app.js uses await on every call.
 */

const API = '/api/equipment';

class Database {

    // ── internal fetch helper ─────────────────────────────────────────────────
    async _fetch(url, options = {}) {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options,
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || json.message || 'API error');
        return json;
    }

    // ── Equipment ─────────────────────────────────────────────────────────────

    async getEquipmentList() {
        const json = await this._fetch(API);
        return json.data;
    }

    async getEquipmentById(id) {
        const json = await this._fetch(`${API}/${id}`);
        return json.data;
    }

    async saveEquipment(data) {
        const payload = {
            equipment_id:    data.equipmentId,
            equipment_name:  data.equipmentName,
            total_quantity:  data.totalQuantity,
            condition_status: data.conditionStatus,
            notes:           data.notes || null,
        };
        if (data.equipmentId && data.equipmentId.startsWith('EQ-')) {
            // Check if exists — try update first, fall back to create
            try {
                const json = await this._fetch(`${API}/${data.equipmentId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                return json.data;
            } catch (e) {
                // Doesn't exist yet — create
            }
        }
        const json = await this._fetch(API, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return json.data;
    }

    async deleteEquipment(id) {
        await this._fetch(`${API}/${id}`, { method: 'DELETE' });
    }

    async generateNextEquipmentId() {
        // Server auto-generates IDs — return a placeholder; actual ID comes back from POST
        return '';
    }

    // ── Borrow Records ────────────────────────────────────────────────────────

    async getBorrowRecords() {
        const json = await this._fetch(`${API}/borrow/all`);
        return json.data;
    }

    async borrowEquipment(data) {
        const json = await this._fetch(`${API}/borrow`, {
            method: 'POST',
            body: JSON.stringify({
                equipment_id:  data.equipmentId,
                borrowedBy:    data.borrowedBy,
                quantity:      data.quantity,
                dueDate:       data.dueDate,
                category:      data.category,
                categoryOther: data.categoryOther,
                idNo:          data.idNo,
                contactNumber: data.contactNumber,
                useFrom:       data.useFrom,
                issuedBy:      data.issuedBy,
                purpose:       data.purpose,
            }),
        });
        return json.data;
    }

    async returnEquipment(borrowId, returnData) {
        await this._fetch(`${API}/borrow/${borrowId}/return`, {
            method: 'PUT',
            body: JSON.stringify({
                condition:          returnData.condition,
                condition_at_return: returnData.condition,
                notes:              returnData.notes,
            }),
        });
        return true;
    }

    // ── Dashboard Metrics (computed client-side from live data) ───────────────

    async getDashboardMetrics() {
        const [equipmentList, borrowRecords] = await Promise.all([
            this.getEquipmentList(),
            this.getBorrowRecords(),
        ]);

        const activeBorrows = borrowRecords.filter(b => !b.returnDate);

        const inStockCount    = equipmentList.filter(e => e.quantityAvailable > 0).length;
        const outOfStockCount = equipmentList.filter(e => e.quantityAvailable === 0).length;
        const totalBorrowed   = activeBorrows.reduce((s, b) => s + Number(b.quantity), 0);

        const alerts = [];
        equipmentList.forEach(e => {
            if (e.quantityAvailable === 0) {
                alerts.push({ type: 'danger',  message: `🔴 ${e.equipmentName} - Out of Stock` });
            } else if (e.quantityAvailable < e.totalQuantity * 0.2) {
                alerts.push({ type: 'warning', message: `🟡 ${e.equipmentName} - Low Stock (${e.quantityAvailable} of ${e.totalQuantity})` });
            }
        });

        const now = new Date();
        activeBorrows.forEach(b => {
            if (b.dueDate && new Date(b.dueDate) < now) {
                const eq = equipmentList.find(e => e.equipmentId === b.equipmentId);
                alerts.push({ type: 'warning', message: `🔔 Overdue Return: ${eq ? eq.equipmentName : b.equipmentId} by ${b.borrowedBy}` });
            }
        });

        return { equipmentList, inStockCount, outOfStockCount, totalBorrowed, alerts };
    }
}

window.db = new Database();
