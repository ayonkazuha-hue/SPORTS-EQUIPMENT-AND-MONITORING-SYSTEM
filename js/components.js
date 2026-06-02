/**
 * UI Components Generator
 * Generates HTML strings for different views.
 */

const Components = {

    // --- Dashboard View --- //
    renderDashboard: (metrics) => {
        return `
            <div class="section-header animate-fade-in">
                <h2>Dashboard Overview</h2>
            </div>

            <div class="dashboard-grid animate-fade-in">
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="fa-solid fa-boxes-stacked"></i></div>
                    <div class="stat-info">
                        <h3>Total Equipment</h3>
                        <p>${metrics.totalItems}</p>
                    </div>
                </div>
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

            <div class="section-header animate-fade-in" style="animation-delay: 0.1s">
                <h3><i class="fa-solid fa-bell"></i> Alerts & Notifications</h3>
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
            tableRows = `<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-box-open"></i><br>No equipment found. Add some to get started.</td></tr>`;
        } else {
            tableRows = equipments.map(eq => `
                <tr>
                    <td><span class="status-badge ${eq.stockStatus}">${eq.stockStatusText}</span></td>
                    <td><strong>${eq.equipmentId}</strong><br><small class="text-muted">${eq.equipmentName}</small></td>
                    <td>${eq.category}</td>
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
                <button class="btn btn-primary" onclick="app.showAddEquipmentModal()">
                    <i class="fa-solid fa-plus"></i> Add New
                </button>
            </div>

            <div class="table-container animate-fade-in">
                <div class="table-controls">
                    <div>
                        <label>Category Filter:</label>
                        <select id="category-filter" onchange="app.filterEquipmentList()" style="width: auto; padding: 0.4rem; display: inline-block; margin-left: 0.5rem">
                            <option value="All">All Categories</option>
                            <option value="Balls">Balls</option>
                            <option value="Rackets">Rackets & Paddles</option>
                            <option value="Protective Gear">Protective Gear</option>
                            <option value="Nets & Poles">Nets & Poles</option>
                            <option value="Mats">Mats & Floors</option>
                            <option value="Weights">Weights & Resistance</option>
                            <option value="Accessories">Accessories</option>
                        </select>
                    </div>
                    <div>Total Items: <strong>${equipments.length}</strong></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>ID & Name</th>
                            <th>Category</th>
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
                                    <strong>${b.borrowedBy}</strong> borrowed ${b.quantity} unit(s)<br>
                                    <small>Due: ${new Date(b.dueDate).toLocaleDateString()}</small>
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
                    <div class="form-row">
                        <div class="form-group">
                            <label>Quantity to Borrow *</label>
                            <input type="number" id="borrow-qty" required min="1" max="${eq.quantityAvailable}" value="1">
                        </div>
                        <div class="form-group">
                            <label>Borrowed By *</label>
                            <input type="text" id="borrow-user" required placeholder="User name">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expected Return Date *</label>
                            <input type="date" id="borrow-due" required>
                        </div>
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
                    Borrowed By: ${borrow.borrowedBy}<br>
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

    // --- Reports View --- //
    renderReports: () => {
        return `
            <div class="section-header animate-fade-in">
                <h2>Reports & Analytics</h2>
            </div>
            <div class="animate-fade-in" style="background: var(--bg-card); padding: 3rem; text-align: center; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <i class="fa-solid fa-chart-line" style="font-size: 4rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h3>Analytics Dashboard Coming Soon</h3>
                <p class="text-muted">Export functionality and detailed utilization charts will be available here.</p>
            </div>
        `;
    }

};

window.Components = Components;
