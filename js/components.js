/**
 * UI Components Generator
 * Pure render functions — no async calls inside.
 * All data is passed in as parameters from app.js (which fetches from the API).
 */

const Components = {

    // ── Dashboard ─────────────────────────────────────────────────────────────
    // metrics: { inStockCount, outOfStockCount, totalBorrowed, alerts }
    // equipmentList: array of equipment objects
    renderDashboard(metrics, equipmentList = []) {
        const barColors = [
            '#3b82f6','#10b981','#f59e0b','#ef4444',
            '#8b5cf6','#0ea5e9','#ec4899','#14b8a6','#f97316','#84cc16'
        ];
        const maxQty = equipmentList.length > 0 ? Math.max(...equipmentList.map(e => e.totalQuantity || 0)) : 1;

        const barRows = equipmentList.length === 0
            ? `<div style="text-align:center;color:var(--text-muted);padding:2rem 0;font-size:0.875rem;">
                   <i class="fa-solid fa-box-open" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.4;"></i>
                   No equipment added yet.
               </div>`
            : equipmentList.map((eq, i) => {
                const color     = barColors[i % barColors.length];
                const totalPct  = Math.round((eq.totalQuantity   / maxQty) * 100);
                const borrowPct = Math.round((eq.quantityBorrowed / maxQty) * 100);
                const availPct  = Math.round((eq.quantityAvailable / maxQty) * 100);
                return `
                <div style="margin-bottom:1rem;">
                    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.3rem;gap:0.5rem;">
                        <span style="font-size:0.8rem;font-weight:500;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:50%;" title="${eq.equipmentName}">${eq.equipmentName}</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);white-space:nowrap;flex-shrink:0;">
                            Total: <strong style="color:var(--text-primary)">${eq.totalQuantity}</strong>
                            &nbsp;|&nbsp; Borrowed: <strong style="color:var(--warning)">${eq.quantityBorrowed}</strong>
                            &nbsp;|&nbsp; Available: <strong style="color:var(--success)">${eq.quantityAvailable}</strong>
                        </span>
                    </div>
                    <div style="position:relative;height:18px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;">
                        <div style="position:absolute;left:0;top:0;height:100%;width:${totalPct}%;background:${color}22;border-radius:99px;transition:width 0.6s ease;"></div>
                        <div style="position:absolute;left:0;top:0;height:100%;width:${borrowPct}%;background:rgba(245,158,11,0.55);border-radius:99px;transition:width 0.6s ease;"></div>
                        <div style="position:absolute;left:0;top:0;height:100%;width:${availPct}%;background:${color};border-radius:99px;transition:width 0.6s ease;"></div>
                    </div>
                </div>`;
            }).join('');

        return `
            <div class="section-header animate-fade-in">
                <h2>Dashboard Overview</h2>
            </div>

            <div class="dashboard-grid animate-fade-in" style="grid-template-columns:repeat(3,1fr);">
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fa-solid fa-check-circle"></i></div>
                    <div class="stat-info"><h3>In Stock</h3><p>${metrics.inStockCount}</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon yellow"><i class="fa-solid fa-hand-holding"></i></div>
                    <div class="stat-info"><h3>Borrowed</h3><p>${metrics.totalBorrowed}</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="stat-info"><h3>Out of Stock</h3><p>${metrics.outOfStockCount}</p></div>
                </div>
            </div>

            <div class="section-header animate-fade-in" style="animation-delay:0.05s;margin-top:0.5rem;">
                <h3><i class="fa-solid fa-chart-bar" style="color:var(--primary);margin-right:0.5rem;"></i>Equipment Quantity Overview</h3>
                <div style="display:flex;gap:1.25rem;font-size:0.75rem;color:var(--text-muted);align-items:center;">
                    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--primary);margin-right:4px;"></span>Available</span>
                    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(245,158,11,0.55);margin-right:4px;"></span>Borrowed</span>
                </div>
            </div>
            <div class="animate-fade-in" style="animation-delay:0.08s;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem 1.75rem;margin-bottom:2rem;box-shadow:var(--shadow-md);">
                ${barRows}
            </div>`;
    },

    // ── Equipment List ────────────────────────────────────────────────────────
    renderEquipmentList(equipments) {
        let tableRows = equipments.length === 0
            ? `<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-box-open"></i><br>No equipment found. Add some to get started.</td></tr>`
            : equipments.map(eq => `
                <tr>
                    <td><span class="status-badge ${eq.stockStatus}">${eq.stockStatusText}</span></td>
                    <td><strong>${eq.equipmentId}</strong><br><small class="text-muted">${eq.equipmentName}</small></td>
                    <td>${eq.totalQuantity}</td>
                    <td>${eq.quantityBorrowed}</td>
                    <td><strong>${eq.quantityAvailable}</strong></td>
                    <td>
                        <button class="icon-btn" onclick="app.showEquipmentDetails('${eq.equipmentId}')" title="View Details">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="icon-btn btn-danger" onclick="app.deleteEquipment('${eq.equipmentId}')" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`).join('');

        return `
            <div class="section-header animate-fade-in">
                <h2>Equipment Inventory</h2>
                <button class="btn btn-primary" onclick="app.showAddEquipmentModal()">
                    <i class="fa-solid fa-plus"></i> Add New
                </button>
            </div>
            <div class="table-container animate-fade-in">
                <div class="table-controls">
                    <div>Total Items: <strong>${equipments.length}</strong></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Status</th><th>ID &amp; Name</th><th>Total</th>
                            <th>Borrowed</th><th>Available</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>`;
    },

    // ── Add / Edit Equipment Form ─────────────────────────────────────────────
    renderEquipmentForm(eq = null) {
        const isEdit = !!eq;
        return `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Equipment' : 'Add New Equipment'}</h3>
                <button class="close-btn" onclick="app.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <form id="equipment-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Equipment ID</label>
                            <input type="text" id="eq-id" value="${isEdit ? eq.equipmentId : ''}" readonly placeholder="Auto-generated">
                        </div>
                        <div class="form-group">
                            <label>Equipment Name *</label>
                            <input type="text" id="eq-name" required value="${isEdit ? eq.equipmentName : ''}" placeholder="e.g. Basketball">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex:1;">
                            <label>Total Quantity *</label>
                            <input type="number" id="eq-total" required min="0" value="${isEdit ? eq.totalQuantity : ''}" oninput="app.calculateMockAvailability()">
                            <span class="help-text">Manual entry only</span>
                        </div>
                    </div>
                    ${isEdit ? '' : `
                    <div class="form-row">
                        <div class="form-group">
                            <label>Quantity Borrowed</label>
                            <input type="text" id="eq-borrowed" readonly value="0">
                            <span class="help-text">Auto-calculated</span>
                        </div>
                        <div class="form-group">
                            <label>Quantity Available</label>
                            <input type="text" id="eq-available" readonly value="0">
                            <span class="help-text">Auto-calculated</span>
                        </div>
                    </div>`}
                    <hr style="border-color:var(--border-color);margin:1.5rem 0;">
                    <div class="form-row">
                        <div class="form-group" style="flex:1;">
                            <label>Condition Status</label>
                            <select id="eq-condition">
                                <option value="Good"   ${isEdit && eq.conditionStatus === 'Good'   ? 'selected' : ''}>Good</option>
                                <option value="Damage" ${isEdit && eq.conditionStatus === 'Damage' ? 'selected' : ''}>Damage</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea id="eq-notes" rows="3">${isEdit && eq.notes ? eq.notes : ''}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                ${isEdit ? `<button class="btn btn-danger" style="margin-right:auto;" onclick="app.deleteEquipment('${eq.equipmentId}')">Delete</button>` : ''}
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="app.saveEquipmentForm()">${isEdit ? 'Save Changes' : 'Create Equipment'}</button>
            </div>`;
    },

    // ── Equipment Details Modal ───────────────────────────────────────────────
    // allBorrows: full borrow records array (passed in from app.js)
    renderEquipmentDetails(eq, allBorrows = []) {
        const pct = eq.totalQuantity > 0 ? Math.round((eq.quantityAvailable / eq.totalQuantity) * 100) : 0;
        const progressColor = pct === 0 ? 'red' : pct < 20 ? 'yellow' : 'green';
        const activeBorrows = allBorrows.filter(b => b.equipmentId === eq.equipmentId && !b.returnDate);

        return `
            <div class="modal-header">
                <h3 class="modal-title">Equipment Details</h3>
                <button class="close-btn" onclick="app.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" style="display:flex;flex-direction:column;gap:1.5rem;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div>
                        <h2 style="margin:0;">${eq.equipmentName}</h2>
                        <p class="text-muted">${eq.equipmentId}</p>
                    </div>
                    <span class="status-badge ${eq.stockStatus}" style="font-size:0.9rem;padding:0.4rem 1rem;">${eq.stockStatusText}</span>
                </div>
                <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:1.5rem;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                        <span>Total: <strong>${eq.totalQuantity}</strong></span>
                        <span>Available: <strong>${eq.quantityAvailable}</strong></span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar ${progressColor}" style="width:${pct}%"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:0.5rem;font-size:0.85rem;color:var(--text-muted);">
                        <span>Borrowed: ${eq.quantityBorrowed}</span>
                        <span>${pct}% Available</span>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="margin:0;"><label>Condition</label><p>${eq.conditionStatus || 'N/A'}</p></div>
                    <div class="form-group" style="margin:0;"><label>Notes</label><p>${eq.notes || 'N/A'}</p></div>
                </div>
                <div style="border-top:1px solid var(--border-color);padding-top:1rem;">
                    <h4>Active Borrows</h4>
                    ${activeBorrows.length === 0 ? '<p class="text-muted">No active borrows for this item.</p>' : `
                    <div class="alerts-list" style="margin-top:1rem;">
                        ${activeBorrows.map(b => `
                            <div class="alert-item info" style="justify-content:space-between;">
                                <div>
                                    <strong>${b.borrowedBy}</strong>${b.idNo ? ` <span class="text-muted">(${b.idNo})</span>` : ''}
                                    ${b.category ? ` — <small style="color:var(--primary)">${b.category}${b.category==='Others'&&b.categoryOther?` (${b.categoryOther})`:''}</small>` : ''}<br>
                                    ${b.contactNumber ? `<small>Contact: ${b.contactNumber}</small><br>` : ''}
                                    ${b.useFrom ? `<small>Use from: ${new Date(b.useFrom).toLocaleString()}</small><br>` : ''}
                                    <small>Due: ${new Date(b.dueDate).toLocaleDateString()}</small><br>
                                    ${b.issuedBy ? `<small>Issued by: ${b.issuedBy}</small><br>` : ''}
                                    ${b.purpose ? `<small>Purpose: ${b.purpose}</small>` : ''}
                                </div>
                                <button class="btn btn-secondary btn-sm" onclick="app.showReturnModal('${b.borrowId}')">Process Return</button>
                            </div>`).join('')}
                    </div>`}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="app.showEditEquipment('${eq.equipmentId}')"><i class="fa-solid fa-pen"></i> Edit</button>
                ${eq.quantityAvailable > 0 ? `<button class="btn btn-success" onclick="app.showBorrowModal('${eq.equipmentId}')"><i class="fa-solid fa-hand-holding"></i> Borrow</button>` : ''}
            </div>`;
    },

    // ── Borrow Form ───────────────────────────────────────────────────────────
    renderBorrowForm(eq) {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const defaultDT = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        return `
            <div class="modal-header">
                <h3 class="modal-title">Borrow Equipment</h3>
                <button class="close-btn" onclick="app.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div style="background:rgba(255,255,255,0.02);padding:1rem;border-radius:var(--radius-md);margin-bottom:1.5rem;border:1px solid var(--border-color);">
                    <strong>${eq.equipmentName} (${eq.equipmentId})</strong><br>
                    <span style="color:var(--success)">Available to borrow: ${eq.quantityAvailable}</span>
                </div>
                <form id="borrow-form">
                    <input type="hidden" id="borrow-eq-id" value="${eq.equipmentId}">
                    <div class="form-group">
                        <label>Category *</label>
                        <div style="display:flex;flex-wrap:wrap;gap:0.75rem 1.5rem;margin-top:0.4rem;">
                            <label style="display:flex;align-items:center;gap:0.4rem;font-weight:400;cursor:pointer;">
                                <input type="radio" name="borrow-category" value="Faculty" onchange="app.onBorrowCategoryChange(this)"> Faculty
                            </label>
                            <label style="display:flex;align-items:center;gap:0.4rem;font-weight:400;cursor:pointer;">
                                <input type="radio" name="borrow-category" value="Staff" onchange="app.onBorrowCategoryChange(this)"> Staff
                            </label>
                            <label style="display:flex;align-items:center;gap:0.4rem;font-weight:400;cursor:pointer;">
                                <input type="radio" name="borrow-category" value="Student" onchange="app.onBorrowCategoryChange(this)"> Student
                            </label>
                            <label style="display:flex;align-items:center;gap:0.4rem;font-weight:400;cursor:pointer;">
                                <input type="radio" name="borrow-category" value="Others" onchange="app.onBorrowCategoryChange(this)"> Others, Pls. Specify:
                                <input type="text" id="borrow-category-other" placeholder="Specify..." style="width:130px;padding:0.3rem 0.5rem;margin-left:0.25rem;" disabled>
                            </label>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Borrowed By *</label>
                            <input type="text" id="borrow-user" required placeholder="Full name">
                        </div>
                        <div class="form-group">
                            <label id="borrow-idno-label">ID No.</label>
                            <input type="text" id="borrow-id-no" placeholder="e.g. 2024-00123">
                            <span class="help-text" id="borrow-idno-hint">Required for Students</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Contact Number *</label>
                            <input type="tel" id="borrow-contact" required placeholder="e.g. 09171234567">
                        </div>
                        <div class="form-group">
                            <label>Quantity to Borrow *</label>
                            <input type="number" id="borrow-qty" required min="1" max="${eq.quantityAvailable}" value="1">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Date &amp; Time of Use (From) *</label>
                            <input type="datetime-local" id="borrow-use-from" required value="${defaultDT}">
                        </div>
                        <div class="form-group">
                            <label>Expected Return Date *</label>
                            <input type="date" id="borrow-due" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Issued By *</label>
                        <input type="text" id="borrow-issued-by" required placeholder="Name of person issuing the equipment">
                    </div>
                    <div class="form-group">
                        <label>Purpose *</label>
                        <textarea id="borrow-purpose" rows="3" required placeholder="State the purpose of borrowing this equipment..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-success" onclick="app.submitBorrow()"><i class="fa-solid fa-check"></i> Confirm Borrow</button>
            </div>`;
    },

    // ── Return Form ───────────────────────────────────────────────────────────
    renderReturnForm(borrow, eq) {
        return `
            <div class="modal-header">
                <h3 class="modal-title">Return Equipment</h3>
                <button class="close-btn" onclick="app.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div style="background:rgba(255,255,255,0.02);padding:1rem;border-radius:var(--radius-md);margin-bottom:1.5rem;border:1px solid var(--border-color);">
                    <strong>${eq ? eq.equipmentName : borrow.equipmentId}</strong><br>
                    Borrowed By: ${borrow.borrowedBy}${borrow.idNo ? ` <span style="color:var(--text-muted)">(${borrow.idNo})</span>` : ''}<br>
                    ${borrow.contactNumber ? `Contact: ${borrow.contactNumber}<br>` : ''}
                    Quantity to Return: <strong>${borrow.quantity}</strong>
                </div>
                <form id="return-form">
                    <input type="hidden" id="return-borrow-id" value="${borrow.borrowId}">
                    <div class="form-group">
                        <label>Condition upon return *</label>
                        <select id="return-condition" required>
                            <option value="Good">Good</option>
                            <option value="Damage">Damage</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Notes (Optional)</label>
                        <textarea id="return-notes" rows="2" placeholder="Any damage or issues?"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="app.submitReturn()"><i class="fa-solid fa-rotate-left"></i> Confirm Return</button>
            </div>`;
    },

    // ── Borrow History ────────────────────────────────────────────────────────
    renderBorrowHistory(borrows) {
        const sorted = [...borrows].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

        const fmt = (iso) => {
            if (!iso) return '—';
            const d = new Date(iso);
            return d.toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'2-digit' })
                 + ' ' + d.toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit', hour12:true });
        };
        const fmtDate = (s) => {
            if (!s) return '—';
            const d = new Date(s);
            return d.toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'2-digit' });
        };

        const totalActive   = sorted.filter(b => !b.returnDate).length;
        const totalReturned = sorted.filter(b =>  b.returnDate).length;
        const totalOverdue  = sorted.filter(b => !b.returnDate && b.dueDate && new Date(b.dueDate) < new Date()).length;

        const years = [...new Set(sorted.map(b => b.borrowDate ? new Date(b.borrowDate).getFullYear() : null).filter(Boolean))].sort((a,b) => b - a);

        let tableRows = sorted.length === 0
            ? `<tr><td colspan="9" class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i><br>No borrow records yet.</td></tr>`
            : sorted.map((b, i) => {
                const isActive  = !b.returnDate;
                const isOverdue = isActive && b.dueDate && new Date(b.dueDate) < new Date();
                const badge     = isActive
                    ? (isOverdue ? '<span class="status-badge out-of-stock">⚠ Overdue</span>' : '<span class="status-badge low-stock">🟡 Active</span>')
                    : '<span class="status-badge in-stock">✅ Returned</span>';
                const catDisplay = b.category === 'Others' && b.categoryOther ? `Others (${b.categoryOther})` : (b.category || '—');
                const eqName    = b.equipmentName || b.equipmentId;

                return `
                <tr>
                    <td style="color:var(--text-muted);font-size:0.8rem;">${i+1}</td>
                    <td>
                        <strong>${b.borrowedBy || '—'}</strong><br>
                        <small class="text-muted">${b.idNo || ''}</small><br>
                        <small style="color:var(--primary)">${catDisplay}</small>
                    </td>
                    <td><small>${b.contactNumber || '—'}</small></td>
                    <td>
                        <strong>${eqName}</strong><br>
                        <small class="text-muted">${b.equipmentId}</small>
                    </td>
                    <td style="text-align:center;">${b.quantity}</td>
                    <td><small>${fmt(b.borrowDate)}</small></td>
                    <td><small>${b.useFrom ? fmt(b.useFrom) : '—'}</small></td>
                    <td>
                        <small>${fmtDate(b.dueDate)}</small><br>
                        ${b.returnDate ? `<small style="color:var(--success)">Returned: ${fmt(b.returnDate)}</small>` : ''}
                    </td>
                    <td>${badge}</td>
                </tr>
                ${(b.purpose || b.issuedBy) ? `
                <tr style="background:rgba(255,255,255,0.01);">
                    <td></td>
                    <td colspan="8" style="padding-top:0;padding-bottom:0.75rem;line-height:1.6;">
                        ${b.issuedBy ? `<small style="color:var(--text-muted);"><i class="fa-solid fa-user-check" style="font-size:0.65rem;margin-right:4px;"></i>Issued by: <strong>${b.issuedBy}</strong></small><br>` : ''}
                        ${b.purpose  ? `<small style="color:var(--text-muted);"><i class="fa-solid fa-quote-left" style="font-size:0.65rem;margin-right:4px;"></i>${b.purpose}</small>` : ''}
                    </td>
                </tr>` : ''}`;
            }).join('');

        return `
            <div class="section-header animate-fade-in">
                <h2>Borrow History</h2>
            </div>

            <div class="dashboard-grid animate-fade-in" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.5rem;">
                <div class="stat-card">
                    <div class="stat-icon yellow"><i class="fa-solid fa-hand-holding"></i></div>
                    <div class="stat-info"><h3>Currently Borrowed</h3><p>${totalActive}</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fa-solid fa-rotate-left"></i></div>
                    <div class="stat-info"><h3>Returned</h3><p>${totalReturned}</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="stat-info"><h3>Overdue</h3><p>${totalOverdue}</p></div>
                </div>
            </div>

            <div class="table-container animate-fade-in">
                <div class="table-controls" style="flex-wrap:wrap;gap:0.75rem;">
                    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center;">
                        <label style="margin:0;">Status:</label>
                        <select id="history-filter" onchange="app.filterBorrowHistory()" style="width:auto;padding:0.4rem;">
                            <option value="all">All Records</option>
                            <option value="active">Active Only</option>
                            <option value="returned">Returned Only</option>
                            <option value="overdue">Overdue Only</option>
                        </select>
                        <label style="margin:0;">Month:</label>
                        <select id="history-month" onchange="app.filterBorrowHistory()" style="width:auto;padding:0.4rem;">
                            <option value="all">All Months</option>
                            <option value="1">January</option><option value="2">February</option>
                            <option value="3">March</option><option value="4">April</option>
                            <option value="5">May</option><option value="6">June</option>
                            <option value="7">July</option><option value="8">August</option>
                            <option value="9">September</option><option value="10">October</option>
                            <option value="11">November</option><option value="12">December</option>
                        </select>
                        <label style="margin:0;">Year:</label>
                        <select id="history-year" onchange="app.filterBorrowHistory()" style="width:auto;padding:0.4rem;">
                            <option value="all">All Years</option>
                            ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
                        </select>
                    </div>
                    <div>Total Records: <strong>${sorted.length}</strong></div>
                </div>
                <div style="overflow-x:auto;">
                    <table id="history-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Borrower</th><th>Contact</th><th>Equipment</th>
                                <th>Qty</th><th>Date Borrowed</th><th>Use From</th>
                                <th>Due / Returned</th><th>Status</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            </div>`;
    },
};

window.Components = Components;
