/**
 * Application Controller — async/await edition
 * All db calls are now real API requests (no more localStorage).
 */

const app = {

    init() {
        this.bindEvents();
        this.handleRoute();
    },

    bindEvents() {
        window.addEventListener('hashchange', () => this.handleRoute());
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    },

    // ── Routing ──────────────────────────────────────────────────────────────
    async handleRoute() {
        const hash = window.location.hash || '#dashboard';
        const viewContainer = document.getElementById('app-view');

        // Show loading skeleton while fetching
        viewContainer.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:40vh;flex-direction:column;gap:1rem;color:var(--text-muted);">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem;color:var(--primary);"></i>
                <span>Loading…</span>
            </div>`;

        try {
            switch (hash) {
                case '#dashboard': {
                    const metrics = await window.db.getDashboardMetrics();
                    viewContainer.innerHTML = Components.renderDashboard(metrics, metrics.equipmentList);
                    await this.updateBadge(metrics);
                    break;
                }
                case '#equipment': {
                    const list = await window.db.getEquipmentList();
                    viewContainer.innerHTML = Components.renderEquipmentList(list);
                    await this.updateBadge();
                    break;
                }
                case '#history': {
                    const borrows = await window.db.getBorrowRecords();
                    viewContainer.innerHTML = Components.renderBorrowHistory(borrows);
                    await this.updateBadge();
                    break;
                }
                default: {
                    const metrics = await window.db.getDashboardMetrics();
                    viewContainer.innerHTML = Components.renderDashboard(metrics, metrics.equipmentList);
                    await this.updateBadge(metrics);
                }
            }
        } catch (err) {
            viewContainer.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:40vh;flex-direction:column;gap:1rem;color:var(--danger);">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;"></i>
                    <strong>Failed to load data</strong>
                    <span style="font-size:0.85rem;color:var(--text-muted);">${err.message}</span>
                    <button class="btn btn-primary" onclick="app.handleRoute()">
                        <i class="fa-solid fa-rotate-right"></i> Retry
                    </button>
                </div>`;
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="${hash}"]`);
        if (activeLink) activeLink.classList.add('active');
    },

    // ── Notifications ─────────────────────────────────────────────────────────
    async updateBadge(metrics) {
        if (!metrics) {
            try { metrics = await window.db.getDashboardMetrics(); } catch(e) { return; }
        }
        const badge     = document.getElementById('notification-badge');
        const btn       = document.getElementById('notification-btn');
        const notifList = document.getElementById('notif-list');
        const count     = metrics.alerts.length;

        if (badge) { badge.innerText = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
        if (btn) {
            btn.classList.remove('has-alerts');
            if (count > 0) { void btn.offsetWidth; btn.classList.add('has-alerts'); }
        }
        if (notifList) {
            notifList.innerHTML = count === 0
                ? `<div class="notif-empty"><i class="fa-solid fa-check-circle"></i><span>All clear! No alerts right now.</span></div>`
                : metrics.alerts.map(a => {
                    const iconMap = { danger: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-info-circle' };
                    return `<div class="notif-item ${a.type}"><i class="fa-solid ${iconMap[a.type]||'fa-bell'}"></i><span>${a.message}</span></div>`;
                  }).join('');
        }
    },

    toggleNotifications(forceState) {
        const dropdown = document.getElementById('notification-dropdown');
        if (!dropdown) return;
        const shouldOpen = forceState !== undefined ? forceState : !dropdown.classList.contains('open');
        if (shouldOpen) {
            dropdown.classList.add('open');
            setTimeout(() => {
                document.addEventListener('click', this._notifOutsideHandler = (e) => {
                    if (!document.getElementById('notification-wrapper').contains(e.target))
                        this.toggleNotifications(false);
                }, { once: true });
            }, 10);
        } else {
            dropdown.classList.remove('open');
            const list = document.getElementById('notif-list');
            if (list) list.style.maxHeight = '';
            const btn = document.getElementById('notif-view-all-btn');
            if (btn) { btn.dataset.expanded = ''; btn.innerHTML = '<i class="fa-solid fa-chevron-down" id="notif-expand-icon" style="margin-right:0.4rem;"></i>View All'; }
            if (this._notifOutsideHandler) { document.removeEventListener('click', this._notifOutsideHandler); this._notifOutsideHandler = null; }
        }
    },

    expandNotifications() {
        const list = document.getElementById('notif-list');
        const btn  = document.getElementById('notif-view-all-btn');
        if (!list) return;
        if (btn.dataset.expanded === 'true') {
            list.style.maxHeight = '';
            btn.dataset.expanded = 'false';
            btn.innerHTML = '<i class="fa-solid fa-chevron-down" id="notif-expand-icon" style="margin-right:0.4rem;"></i>View All';
        } else {
            list.style.maxHeight = list.scrollHeight + 'px';
            btn.dataset.expanded = 'true';
            btn.innerHTML = '<i class="fa-solid fa-chevron-up" id="notif-expand-icon" style="margin-right:0.4rem;"></i>Show Less';
        }
    },

    clearNotifications() {
        const notifList = document.getElementById('notif-list');
        if (notifList) {
            notifList.style.maxHeight = '';
            notifList.innerHTML = `<div class="notif-empty"><i class="fa-solid fa-check-circle"></i><span>All clear! No alerts right now.</span></div>`;
        }
        const badge = document.getElementById('notification-badge');
        if (badge) { badge.innerText = '0'; badge.style.display = 'none'; }
        const btn = document.getElementById('notification-btn');
        if (btn) btn.classList.remove('has-alerts');
        const viewAllBtn = document.getElementById('notif-view-all-btn');
        if (viewAllBtn) { viewAllBtn.dataset.expanded = ''; viewAllBtn.innerHTML = '<i class="fa-solid fa-chevron-down" id="notif-expand-icon" style="margin-right:0.4rem;"></i>View All'; }
        this.toggleNotifications(false);
    },

    // ── Modals ────────────────────────────────────────────────────────────────
    showModal(htmlContent) {
        const container = document.getElementById('modal-container');
        container.innerHTML = `<div class="modal-overlay"><div class="modal animate-fade-in">${htmlContent}</div></div>`;
        setTimeout(() => container.querySelector('.modal-overlay').classList.add('active'), 10);
    },

    closeModal() {
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => { document.getElementById('modal-container').innerHTML = ''; }, 300);
        }
    },

    // ── Stock List (Dashboard In Stock / Out of Stock cards) ──────────────────
    async showStockList(type) {
        try {
            const metrics = await window.db.getDashboardMetrics();
            this.showModal(Components.renderStockListModal(type, metrics.equipmentList));
        } catch (e) { this.showToast('Failed to load equipment list.', 'error'); }
    },

    // ── Active Borrowers (Dashboard Borrowed card) ────────────────────────────
    async showActiveBorrowers() {
        try {
            const metrics = await window.db.getDashboardMetrics();
            this.showModal(Components.renderActiveBorrowersModal(metrics.activeBorrows, metrics.equipmentList));
        } catch (e) { this.showToast('Failed to load borrowers.', 'error'); }
    },

    async showEquipmentDetailsFromBorrower(equipmentId) {
        // Close the active borrowers modal, then open equipment details
        this.closeModal();
        // Small delay to let close animation finish before opening next modal
        setTimeout(async () => {
            try {
                const [eq, borrows] = await Promise.all([
                    window.db.getEquipmentById(equipmentId),
                    window.db.getBorrowRecords(),
                ]);
                if (eq) this.showModal(Components.renderEquipmentDetails(eq, borrows));
            } catch (e) { this.showToast('Failed to load equipment details.', 'error'); }
        }, 320);
    },

    // ── Equipment ─────────────────────────────────────────────────────────────
    showAddEquipmentModal() {
        this.showModal(Components.renderEquipmentForm());
    },

    async showEditEquipment(id) {
        try {
            const eq = await window.db.getEquipmentById(id);
            if (eq) this.showModal(Components.renderEquipmentForm(eq));
        } catch (e) { this.showToast('Failed to load equipment.', 'error'); }
    },

    async showEquipmentDetails(id) {
        try {
            const [eq, borrows] = await Promise.all([
                window.db.getEquipmentById(id),
                window.db.getBorrowRecords(),
            ]);
            if (eq) this.showModal(Components.renderEquipmentDetails(eq, borrows));
        } catch (e) { this.showToast('Failed to load equipment details.', 'error'); }
    },

    calculateMockAvailability() {
        const total = document.getElementById('eq-total')?.value;
        const el    = document.getElementById('eq-available');
        if (el && total) el.value = total;
    },

    async saveEquipmentForm() {
        const form = document.getElementById('equipment-form');
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const data = {
            equipmentId:    document.getElementById('eq-id').value,
            equipmentName:  document.getElementById('eq-name').value,
            totalQuantity:  parseInt(document.getElementById('eq-total').value),
            conditionStatus: document.getElementById('eq-condition').value,
            notes:          document.getElementById('eq-notes').value,
        };

        try {
            await window.db.saveEquipment(data);
            this.closeModal();
            this.showToast('Equipment saved successfully!', 'success');
            this.handleRoute();
        } catch (e) { this.showToast(e.message || 'Failed to save equipment.', 'error'); }
    },

    async deleteEquipment(id) {
        if (!confirm('Are you sure you want to delete this equipment?')) return;
        try {
            await window.db.deleteEquipment(id);
            this.closeModal();
            this.showToast('Equipment deleted.', 'success');
            this.handleRoute();
        } catch (e) { this.showToast(e.message || 'Failed to delete equipment.', 'error'); }
    },

    // ── Borrow / Return ───────────────────────────────────────────────────────
    async showBorrowModal(eqId) {
        try {
            const eq = await window.db.getEquipmentById(eqId);
            if (eq) this.showModal(Components.renderBorrowForm(eq));
        } catch (e) { this.showToast('Failed to load equipment.', 'error'); }
    },

    onBorrowCategoryChange(radio) {
        const idNoInput  = document.getElementById('borrow-id-no');
        const idNoLabel  = document.getElementById('borrow-idno-label');
        const idNoHint   = document.getElementById('borrow-idno-hint');
        const otherInput = document.getElementById('borrow-category-other');

        if (radio.value === 'Student') {
            idNoInput.required = true;
            idNoInput.placeholder = 'e.g. 2024-00123';
            idNoLabel.textContent = 'ID No. *';
            idNoHint.textContent = 'Required for Students';
            idNoHint.style.color = 'var(--warning)';
        } else {
            idNoInput.required = false;
            idNoInput.placeholder = 'Optional';
            idNoLabel.textContent = 'ID No.';
            idNoHint.textContent = 'Optional for ' + radio.value;
            idNoHint.style.color = '';
        }
        if (radio.value === 'Others') {
            otherInput.disabled = false; otherInput.required = true; otherInput.focus();
        } else {
            otherInput.disabled = true; otherInput.required = false; otherInput.value = '';
        }
    },

    async submitBorrow() {
        const form = document.getElementById('borrow-form');
        const categoryRadio = document.querySelector('input[name="borrow-category"]:checked');
        if (!categoryRadio) { this.showToast('Please select a category.', 'error'); return; }
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const category      = categoryRadio.value;
        const categoryOther = category === 'Others' ? document.getElementById('borrow-category-other').value.trim() : '';

        const data = {
            equipmentId:   document.getElementById('borrow-eq-id').value,
            quantity:      parseInt(document.getElementById('borrow-qty').value),
            borrowedBy:    document.getElementById('borrow-user').value,
            category,
            categoryOther,
            idNo:          document.getElementById('borrow-id-no').value,
            contactNumber: document.getElementById('borrow-contact').value,
            useFrom:       document.getElementById('borrow-use-from').value,
            dueDate:       document.getElementById('borrow-due').value,
            issuedBy:      document.getElementById('borrow-issued-by').value,
            purpose:       document.getElementById('borrow-purpose').value,
        };

        try {
            await window.db.borrowEquipment(data);
            this.closeModal();
            this.showToast('Equipment borrowed successfully.', 'success');
            this.handleRoute();
        } catch (e) { this.showToast(e.message || 'Failed to borrow equipment.', 'error'); }
    },

    async showReturnModal(borrowId) {
        try {
            const borrows = await window.db.getBorrowRecords();
            const borrow  = borrows.find(b => b.borrowId === borrowId);
            if (borrow) {
                const eq = await window.db.getEquipmentById(borrow.equipmentId);
                this.showModal(Components.renderReturnForm(borrow, eq));
            }
        } catch (e) { this.showToast('Failed to load borrow record.', 'error'); }
    },

    async submitReturn() {
        const form = document.getElementById('return-form');
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const borrowId = document.getElementById('return-borrow-id').value;
        const data = {
            condition: document.getElementById('return-condition').value,
            notes:     document.getElementById('return-notes').value,
        };

        try {
            await window.db.returnEquipment(borrowId, data);
            this.closeModal();
            this.showToast('Equipment returned successfully.', 'success');
            this.handleRoute();
        } catch (e) { this.showToast(e.message || 'Failed to return equipment.', 'error'); }
    },

    // ── Filtering ─────────────────────────────────────────────────────────────
    async filterBorrowHistory() {
        const statusFilter = document.getElementById('history-filter')?.value || 'all';
        const monthFilter  = document.getElementById('history-month')?.value  || 'all';
        const yearFilter   = document.getElementById('history-year')?.value   || 'all';

        try {
            let filtered = await window.db.getBorrowRecords();
            const now = new Date();

            if (statusFilter === 'active')   filtered = filtered.filter(b => !b.returnDate);
            if (statusFilter === 'returned')  filtered = filtered.filter(b =>  b.returnDate);
            if (statusFilter === 'overdue')   filtered = filtered.filter(b => !b.returnDate && b.dueDate && new Date(b.dueDate) < now);

            if (monthFilter !== 'all') filtered = filtered.filter(b => b.borrowDate && new Date(b.borrowDate).getMonth() + 1 === parseInt(monthFilter));
            if (yearFilter  !== 'all') filtered = filtered.filter(b => b.borrowDate && new Date(b.borrowDate).getFullYear() === parseInt(yearFilter));

            document.getElementById('app-view').innerHTML = Components.renderBorrowHistory(filtered);
            setTimeout(() => {
                const s = document.getElementById('history-filter');
                const m = document.getElementById('history-month');
                const y = document.getElementById('history-year');
                if (s) s.value = statusFilter;
                if (m) m.value = monthFilter;
                if (y) y.value = yearFilter;
            }, 10);
        } catch (e) { this.showToast('Filter failed: ' + e.message, 'error'); }
    },

    // ── Toast ─────────────────────────────────────────────────────────────────
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-triangle-exclamation', info: 'fa-info-circle' };
        toast.innerHTML = `<i class="fa-solid ${icons[type]||icons.info}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3500);
    },
};

document.addEventListener('DOMContentLoaded', () => app.init());
window.app = app;
