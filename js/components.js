/**
 * UI Components Generator
 * Generates HTML strings for different views.
 */

const Components = {

    // --- Dashboard View --- //
    renderDashboard: (metrics) => {
        // Build bar chart from live equipment list
        const equipmentList = window.db.getEquipmentList();
        const maxQty = equipmentList.length > 0 ? Math.max(...equipmentList.map(e => e.totalQuantity)) : 1;

        // Cycle of bar colours
        const barColors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6',
            '#f97316', '#84cc16'
        ];

        const barRows = equipmentList.length === 0
            ? `<div style="text-align:center; color:var(--text-muted); padding:2rem 0; font-size:0.875rem;">
                   <i class="fa-solid fa-box-open" style="font-size:2rem; display:block; margin-bottom:0.5rem; opacity:0.4;"></i>
                   No equipment added yet.
               </div>`
            : equipmentList.map((eq, i) => {
                const color = barColors[i % barColors.length];
                const totalPct  = Math.round((eq.totalQuantity  / maxQty) * 100);
                const borrowPct = Math.round((eq.quantityBorrowed / maxQty) * 100);
                const availPct  = Math.round((eq.quantityAvailable / maxQty) * 100);
                return `
                    <div style="margin-bottom:1rem;">
                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.3rem;">
                            <span style="font-size:0.8rem; font-weight:500; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:55%;" title="${eq.equipmentName}">${eq.equipmentName}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap; margin-left:0.5rem;">
                                Total: <strong style="color:var(--text-primary)">${eq.totalQuantity}</strong>
                                &nbsp;|&nbsp; Borrowed: <strong style="color:var(--warning)">${eq.quantityBorrowed}</strong>
                                &nbsp;|&nbsp; Available: <strong style="color:var(--success)">${eq.quantityAvailable}</strong>
                            </span>
                        </div>
                        <!-- Total bar (background) -->
                        <div style="position:relative; height:18px; background:rgba(255,255,255,0.05); border-radius:99px; overflow:hidden;">
                            <!-- Total fill -->
                            <div style="position:absolute; left:0; top:0; height:100%; width:${totalPct}%; background:${color}22; border-radius:99px; transition:width 0.6s ease;"></div>
                            <!-- Borrowed fill -->
                            <div style="position:absolute; left:0; top:0; height:100%; width:${borrowPct}%; background:rgba(245,158,11,0.55); border-radius:99px; transition:width 0.6s ease;"></div>
                            <!-- Available fill -->
                            <div style="position:absolute; left:0; top:0; height:100%; width:${availPct}%; background:${color}; border-radius:99px; transition:width 0.6s ease;"></div>
                        </div>
                    </div>
                `;
            }).join('');

        return `
            <div class="section-header animate-fade-in">
                <h2>Dashboard Overview</h2>
            </div>

            <!-- Stat Cards -->
            <div class="dashboard-grid animate-fade-in" style="grid-template-columns: repeat(3, 1fr);">
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fa-solid fa-check-circle"></i></div>
                    <div class="stat-info">
                        <h3>In Stock</h3>
                        <p>${metrics.inStockCount}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon yellow"><i class="fa-solid fa-hand-holding"></i></div>
                    <div class="stat-info">
                        <h3>Borrowed</h3>
                        <p>${metrics.totalBorrowed}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="stat-info">
                        <h3>Out of Stock</h3>
                        <p>${metrics.outOfStockCount}</p>
                    </div>
                </div>
            </div>

            <!-- Equipment Quantity Bar Chart -->
            <div class="section-header animate-fade-in" style="animation-delay: 0.05s; margin-top:0.5rem;">
                <h3><i class="fa-solid fa-chart-bar" style="color:var(--primary); margin-right:0.5rem;"></i> Equipment Quantity Overview</h3>
                <div style="display:flex; gap:1.25rem; font-size:0.75rem; color:var(--text-muted); align-items:center;">
                    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--primary);margin-right:4px;"></span>Available</span>
                    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(245,158,11,0.55);margin-right:4px;"></span>Borrowed</span>
                </div>
            </div>
            <div class="animate-fade-in" style="animation-delay:0.08s; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem 1.75rem; margin-bottom:2rem; box-shadow:var(--shadow-md);">
                ${barRows}
            </div>

            <!-- Alerts -->
            <div class="section-header animate-fade-in" style="animation-delay: 0.1s">
                <h3><i class="fa-solid fa-bell"></i> Alerts &amp; Notifications</h3>
            </div>
            <div class="alerts-list animate-fade-in" style="animation-delay: 0.1s">
                ${metrics.alerts.length > 0 ? metrics.alerts.map(a => `
                    <div class="alert-item ${a.type}">
                        <span>${a.message}</span>
                    </div>
                `).join('') : `
                    <div class="alert-item info">
                        <span><i class="fa-solid fa-info-circle"></i> All equipment is well stocked and no returns are overdue.</span>
                    </div>
                `}
            </div>
        `;
    },

    // --- Equipment List View --- //
    renderEquipmentList: (equipments) => {
        let tableRows = '';
        if (equipments.length === 0) {
            tableRows = `<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-box-open"></i><br>No equipment found. Add some to get started.</td></tr>`;
        } else {
            tableRows = equipments.map(eq => `
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
                        <button class="icon-btn btn-danger" onclick="app.deleteEquipment('${eq.equipmentId}')" title="Delete Equipment">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        return `
            <div class="section-header animate-fade-in">
                <h2>Equipment Inventory</h2>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <button class="btn btn-secondary" onclick="app.resetBorrowRecords()">
                        <i class="fa-solid fa-rotate-left"></i> Reset Borrows
                    </button>
                    <button class="btn btn-danger" onclick="app.resetAllEquipment()">
                        <i class="fa-solid fa-trash-can"></i> Reset All Equipment
                    </button>
                    <button class="btn btn-primary" onclick="app.showAddEquipmentModal()">
                        <i class="fa-solid fa-plus"></i> Add New
                    </button>
                </div>
            </div>

            <div class="table-container animate-fade-in">
                <div class="table-controls">
                    <div>Total Items: <strong>${equipments.length}</strong></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>ID & Name</th>
                            <th>Total</th>
                            <th>Borrowed</th>
                            <th>Available</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="equipment-table-body">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    },

    // --- Add/Edit Equipment Form Modal --- //
    renderEquipmentForm: (eq = null) => {
        const isEdit = !!eq;
        const nextEquipmentId = !isEdit ? window.db.generateNextEquipmentId() : '';
        return `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Equipment' : 'Add New Equipment'}</h3>
                <button class="close-btn" onclick="app.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <form id="equipment-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Equipment ID *</label>
                            <input type="text" id="eq-id" required value="${isEdit ? eq.equipmentId : nextEquipmentId}" readonly placeholder="Auto-generated ID">
                        </div>
                        <div class="form-group">
                            <label>Equipment Name *</label>
                            <input type="text" id="eq-name" required value="${isEdit ? eq.equipmentName : ''}" placeholder="e.g. Spalding Basketball">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
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
                    </div>
                    `}

                    <hr style="border-color: var(--border-color); margin: 1.5rem 0;">

                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>Condition Status</label>
                            <select id="eq-condition">
                                <option value="Good" ${isEdit && eq.conditionStatus === 'Good' ? 'selected' : ''}>Good</option>
                                <option value="Fair" ${isEdit && eq.conditionStatus === 'Fair' ? 'selected' : ''}>Fair</option>
                                <option value="Needs Repair" ${isEdit && eq.conditionStatus === 'Needs Repair' ? 'selected' : ''}>Needs Repair</option>
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
                ${isEdit ? `<button class="btn btn-danger" style="margin-right: auto;" onclick="app.deleteEquipment('${eq.equipmentId}')">Delete</button>` : ''}
                <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="app.saveEquipmentForm()">${isEdit ? 'Save Changes' : 'Create Equipment'}</button>
            </div>
        `;
    },

    // --- Equipment Details Modal --- //
    renderEquipmentDetails: (eq) => {
        const percentAvailable = eq.totalQuantity > 0 ? Math.round((eq.quantityAvailable / eq.totalQuantity) * 100) : 0;
        let progressColor = 'green';
        if (percentAvailable === 0) progressColor = 'red';
        else if (percentAvailable < 20) progressColor = 'yellow';

        const activeBorrows = window.db.getBorrowRecords().filter(b => b.equipmentId === eq.equipmentId && b.returnDate === null);
        
        return `
            <div class="modal-header">
                <h3 class="modal-title">Equipment Details</h3>
                <button class="close-btn" onclick="app.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h2 style="margin: 0;">${eq.equipmentName}</h2>
                        <p class="text-muted">${eq.equipmentId} • ${eq.category}</p>
                    </div>
                    <span class="status-badge ${eq.stockStatus}" style="font-size: 0.9rem; padding: 0.4rem 1rem;">${eq.stockStatusText}</span>
                </div>

                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Total Quantity: <strong>${eq.totalQuantity}</strong></span>
                        <span>Available: <strong>${eq.quantityAvailable}</strong></span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar ${progressColor}" style="width: ${percentAvailable}%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
                        <span>Borrowed: ${eq.quantityBorrowed}</span>
                        <span>${percentAvailable}% Available</span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group" style="margin:0;">
                        <label>Condition</label>
                        <p>${eq.conditionStatus || 'N/A'}</p>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label>Location</label>
                        <p>${eq.location || 'N/A'}</p>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label>Purchase Date</label>
                        <p>${eq.purchaseDate || 'N/A'}</p>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                    <h4>Active Borrows</h4>
                    ${activeBorrows.length === 0 ? '<p class="text-muted">No active borrows for this item.</p>' : `
                    <div class="alerts-list" style="margin-top: 1rem;">
                        ${activeBorrows.map(b => `
                            <div class="alert-item info" style="justify-content: space-between;">
                                <div>
                                    <strong>${b.borrowedBy}</strong>${b.idNo ? ` <span class="text-muted">(${b.idNo})</span>` : ''} — <small style="color:var(--primary)">${b.category || ''}${b.category === 'Others' && b.categoryOther ? ` (${b.categoryOther})` : ''}</small><br>
                                    ${b.contactNumber ? `<small>Contact: ${b.contactNumber}</small><br>` : ''}
                                    ${b.useFrom ? `<small>Use from: ${new Date(b.useFrom).toLocaleString()}</small><br>` : ''}
                                    <small>Due: ${new Date(b.dueDate).toLocaleDateString()}</small><br>
                                    ${b.issuedBy ? `<small>Issued by: ${b.issuedBy}</small><br>` : ''}
                                    ${b.purpose ? `<small>Purpose: ${b.purpose}</small>` : ''}
                                </div>
                                <button class="btn btn-secondary btn-sm" onclick="app.showReturnModal('${b.borrowId}')">Process Return</button>
                            </div>
                        `).join('')}
                    </div>
                    `}
                </div>

            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="app.showEditEquipment('${eq.equipmentId}')"><i class="fa-solid fa-pen"></i> Edit</button>
                ${eq.quantityAvailable > 0 ? `<button class="btn btn-success" onclick="app.showBorrowModal('${eq.equipmentId}')"><i class="fa-solid fa-hand-holding"></i> Borrow</button>` : ''}
            </div>
        `;
    },

    // --- Borrow Form Modal --- //
    renderBorrowForm: (eq) => {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const defaultDateTime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

        return `
            <div class="modal-header">
                <h3 class="modal-title">Borrow Equipment</h3>
                <button class="close-btn" onclick="app.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
                    <strong>${eq.equipmentName} (${eq.equipmentId})</strong><br>
                    <span style="color: var(--success)">Available to borrow: ${eq.quantityAvailable}</span>
                </div>
                <form id="borrow-form">
                    <input type="hidden" id="borrow-eq-id" value="${eq.equipmentId}">

                    <!-- Category -->
                    <div class="form-group">
                        <label>Category *</label>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; margin-top: 0.4rem;" id="borrow-category-group">
                            <label style="display:flex; align-items:center; gap:0.4rem; font-weight:400; cursor:pointer;">
                                <input type="radio" name="borrow-category" value="Faculty" onchange="app.onBorrowCategoryChange(this)"> Faculty
                            </label>
                            <label style="display:flex; align-items:center; gap:0.4rem; font-weight:400; cursor:pointer;">
                                <input type="radio" name="borrow-category" value="Staff" onchange="app.onBorrowCategoryChange(this)"> Staff
                            </label>
                            <label style="display:flex; align-items:center; gap:0.4rem; font-weight:400; cursor:pointer;">
                                <input type="radio" name="borrow-category" value="Student" onchange="app.onBorrowCategoryChange(this)"> Student
                            </label>
                            <label style="display:flex; align-items:center; gap:0.4rem; font-weight:400; cursor:pointer;">
                                <input type="radio" name="borrow-category" value="Others" onchange="app.onBorrowCategoryChange(this)"> Others, Pls. Specify:
                                <input type="text" id="borrow-category-other" placeholder="Specify..." style="width:130px; padding:0.3rem 0.5rem; margin-left:0.25rem;" disabled>
                            </label>
                        </div>
                    </div>

                    <!-- Borrower info -->
                    <div class="form-row">
                        <div class="form-group">
                            <label>Borrowed By *</label>
                            <input type="text" id="borrow-user" required placeholder="Full name">
                        </div>
                        <div class="form-group" id="borrow-idno-group">
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
                            <input type="datetime-local" id="borrow-use-from" required value="${defaultDateTime}">
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
            </div>
        `;
    },

    // --- Return Form Modal --- //
    renderReturnForm: (borrow, eq) => {
        return `
            <div class="modal-header">
                <h3 class="modal-title">Return Equipment</h3>
                <button class="close-btn" onclick="app.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
                    <strong>${eq.equipmentName}</strong><br>
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
                            <option value="Fair">Fair</option>
                            <option value="Needs Repair">Needs Repair</option>
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
            </div>
        `;
    },

    // --- Borrow History View --- //
    renderBorrowHistory: (borrows) => {
        // Sort newest first
        const sorted = [...borrows].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

        const formatDT = (iso) => {
            if (!iso) return '—';
            const d = new Date(iso);
            return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: '2-digit' })
                + ' ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
        };

        const formatDate = (str) => {
            if (!str) return '—';
            const d = new Date(str);
            return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: '2-digit' });
        };

        const equipmentList = window.db.getEquipmentList();
        const getEqName = (id) => {
            const eq = equipmentList.find(e => e.equipmentId === id);
            return eq ? eq.equipmentName : id;
        };

        let tableRows = '';
        if (sorted.length === 0) {
            tableRows = `<tr><td colspan="9" class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i><br>No borrow records yet.</td></tr>`;
        } else {
            tableRows = sorted.map((b, i) => {
                const isActive = !b.returnDate;
                const isOverdue = isActive && b.dueDate && new Date(b.dueDate) < new Date();
                const statusLabel = isActive
                    ? (isOverdue ? '<span class="status-badge out-of-stock">⚠ Overdue</span>' : '<span class="status-badge low-stock">🟡 Active</span>')
                    : '<span class="status-badge in-stock">✅ Returned</span>';

                const categoryDisplay = b.category === 'Others' && b.categoryOther
                    ? `Others (${b.categoryOther})`
                    : (b.category || '—');

                return `
                    <tr>
                        <td style="color: var(--text-muted); font-size: 0.8rem;">${i + 1}</td>
                        <td>
                            <strong>${b.borrowedBy || '—'}</strong><br>
                            <small class="text-muted">${b.idNo || ''}</small><br>
                            <small style="color:var(--primary)">${categoryDisplay}</small>
                        </td>
                        <td><small>${b.contactNumber || '—'}</small></td>
                        <td>
                            <strong>${getEqName(b.equipmentId)}</strong><br>
                            <small class="text-muted">${b.equipmentId}</small>
                        </td>
                        <td style="text-align: center;">${b.quantity}</td>
                        <td><small>${formatDT(b.borrowDate)}</small></td>
                        <td><small>${b.useFrom ? formatDT(b.useFrom) : '—'}</small></td>
                        <td><small>${formatDate(b.dueDate)}</small><br>${b.returnDate ? `<small style="color:var(--success)">Returned: ${formatDT(b.returnDate)}</small>` : ''}</td>
                        <td>${statusLabel}</td>
                    </tr>
                    ${(b.purpose || b.issuedBy) ? `
                    <tr style="background: rgba(255,255,255,0.01);">
                        <td></td>
                        <td colspan="8" style="padding-top: 0; padding-bottom: 0.75rem; line-height: 1.6;">
                            ${b.issuedBy ? `<small style="color: var(--text-muted);"><i class="fa-solid fa-user-check" style="font-size:0.65rem; margin-right:4px;"></i>Issued by: <strong>${b.issuedBy}</strong></small><br>` : ''}
                            ${b.purpose ? `<small style="color: var(--text-muted);"><i class="fa-solid fa-quote-left" style="font-size:0.65rem; margin-right:4px;"></i>${b.purpose}</small>` : ''}
                        </td>
                    </tr>` : ''}
                `;
            }).join('');
        }

        const totalActive = sorted.filter(b => !b.returnDate).length;
        const totalReturned = sorted.filter(b => b.returnDate).length;
        const totalOverdue = sorted.filter(b => !b.returnDate && b.dueDate && new Date(b.dueDate) < new Date()).length;

        return `
            <div class="section-header animate-fade-in">
                <h2>Borrow History</h2>
            </div>

            <div class="dashboard-grid animate-fade-in" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.5rem;">
                <div class="stat-card">
                    <div class="stat-icon yellow"><i class="fa-solid fa-hand-holding"></i></div>
                    <div class="stat-info">
                        <h3>Currently Borrowed</h3>
                        <p>${totalActive}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fa-solid fa-rotate-left"></i></div>
                    <div class="stat-info">
                        <h3>Returned</h3>
                        <p>${totalReturned}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="stat-info">
                        <h3>Overdue</h3>
                        <p>${totalOverdue}</p>
                    </div>
                </div>
            </div>

            <div class="table-container animate-fade-in">
                <div class="table-controls">
                    <div style="display:flex; gap: 0.75rem; align-items: center;">
                        <label>Filter:</label>
                        <select id="history-filter" onchange="app.filterBorrowHistory()" style="width: auto; padding: 0.4rem; display: inline-block;">
                            <option value="all">All Records</option>
                            <option value="active">Active Only</option>
                            <option value="returned">Returned Only</option>
                            <option value="overdue">Overdue Only</option>
                        </select>
                    </div>
                    <div>Total Records: <strong>${sorted.length}</strong></div>
                </div>
                <div style="overflow-x: auto;">
                    <table id="history-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Borrower</th>
                                <th>Contact</th>
                                <th>Equipment</th>
                                <th>Qty</th>
                                <th>Date Borrowed</th>
                                <th>Use From</th>
                                <th>Due / Returned</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

};

window.Components = Components;
