/**
 * Application Controller
 * Handles routing, state, and UI interactions.
 */

const app = {
    init() {
        this.bindEvents();
        this.handleRoute(); // initial load
        this.updateBadge();
    },

    bindEvents() {
        // Handle hash changes for routing
        window.addEventListener('hashchange', () => this.handleRoute());

        // Sidebar Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    },

    // --- Routing --- //
    handleRoute() {
        const hash = window.location.hash || '#dashboard';
        const viewContainer = document.getElementById('app-view');

        switch (hash) {
            case '#dashboard':
                viewContainer.innerHTML = Components.renderDashboard(window.db.getDashboardMetrics());
                break;
            case '#equipment':
                viewContainer.innerHTML = Components.renderEquipmentList(window.db.getEquipmentList());
                break;
            case '#history':
                viewContainer.innerHTML = Components.renderBorrowHistory(window.db.getBorrowRecords());
                break;
            default:
                viewContainer.innerHTML = Components.renderDashboard(window.db.getDashboardMetrics());
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="${hash}"]`);
        if (activeLink) activeLink.classList.add('active');
    },

    updateBadge() {
        const metrics = window.db.getDashboardMetrics();
        const badge = document.getElementById('notification-badge');
        const btn   = document.getElementById('notification-btn');
        const notifList = document.getElementById('notif-list');

        const count = metrics.alerts.length;

        if (badge) {
            badge.innerText = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }

        if (btn) {
            if (count > 0) {
                // Remove and re-add class to re-trigger animation
                btn.classList.remove('has-alerts');
                void btn.offsetWidth; // reflow
                btn.classList.add('has-alerts');
            } else {
                btn.classList.remove('has-alerts');
            }
        }

        if (notifList) {
            if (metrics.alerts.length === 0) {
                notifList.innerHTML = `
                    <div class="notif-empty">
                        <i class="fa-solid fa-check-circle"></i>
                        <span>All clear! No alerts right now.</span>
                    </div>`;
            } else {
                notifList.innerHTML = metrics.alerts.map(a => {
                    const iconMap = { danger: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-info-circle' };
                    const icon = iconMap[a.type] || 'fa-bell';
                    return `
                        <div class="notif-item ${a.type}">
                            <i class="fa-solid ${icon}"></i>
                            <span>${a.message}</span>
                        </div>`;
                }).join('');
            }
        }
    },

    toggleNotifications(forceState) {
        const dropdown = document.getElementById('notification-dropdown');
        if (!dropdown) return;
        const isOpen = dropdown.classList.contains('open');
        const shouldOpen = forceState !== undefined ? forceState : !isOpen;
        if (shouldOpen) {
            dropdown.classList.add('open');
            // Close when clicking outside
            setTimeout(() => {
                document.addEventListener('click', this._notifOutsideHandler = (e) => {
                    if (!document.getElementById('notification-wrapper').contains(e.target)) {
                        this.toggleNotifications(false);
                    }
                }, { once: true });
            }, 10);
        } else {
            dropdown.classList.remove('open');
            // Reset expanded state on close
            const list = document.getElementById('notif-list');
            if (list) list.style.maxHeight = '';
            const icon = document.getElementById('notif-expand-icon');
            if (icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
            const btn = document.getElementById('notif-view-all-btn');
            if (btn) btn.dataset.expanded = '';
            if (this._notifOutsideHandler) {
                document.removeEventListener('click', this._notifOutsideHandler);
                this._notifOutsideHandler = null;
            }
        }
    },

    expandNotifications() {
        const list = document.getElementById('notif-list');
        const icon = document.getElementById('notif-expand-icon');
        const btn  = document.getElementById('notif-view-all-btn');
        if (!list) return;

        const isExpanded = btn.dataset.expanded === 'true';
        if (isExpanded) {
            // Collapse back
            list.style.maxHeight = '';
            btn.dataset.expanded = 'false';
            btn.innerHTML = '<i class="fa-solid fa-chevron-down" id="notif-expand-icon" style="margin-right:0.4rem;"></i>View All';
        } else {
            // Expand to show all
            list.style.maxHeight = list.scrollHeight + 'px';
            btn.dataset.expanded = 'true';
            btn.innerHTML = '<i class="fa-solid fa-chevron-up" id="notif-expand-icon" style="margin-right:0.4rem;"></i>Show Less';
        }
    },

    clearNotifications() {
        const notifList = document.getElementById('notif-list');
        const badge = document.getElementById('notification-badge');
        const btn   = document.getElementById('notification-btn');
        const viewAllBtn = document.getElementById('notif-view-all-btn');

        if (notifList) {
            notifList.style.maxHeight = '';
            notifList.innerHTML = `
                <div class="notif-empty">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>All clear! No alerts right now.</span>
                </div>`;
        }
        if (badge) { badge.innerText = '0'; badge.style.display = 'none'; }
        if (btn)   { btn.classList.remove('has-alerts'); }
        if (viewAllBtn) {
            viewAllBtn.dataset.expanded = '';
            viewAllBtn.innerHTML = '<i class="fa-solid fa-chevron-down" id="notif-expand-icon" style="margin-right:0.4rem;"></i>View All';
        }
        this.toggleNotifications(false);
    },

    // --- Modals Management --- //
    showModal(htmlContent) {
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="modal-overlay">
                <div class="modal animate-fade-in">
                    ${htmlContent}
                </div>
            </div>
        `;
        
        // Trigger animation
        setTimeout(() => {
            container.querySelector('.modal-overlay').classList.add('active');
        }, 10);
    },

    closeModal() {
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                document.getElementById('modal-container').innerHTML = '';
            }, 300); // match CSS transition
        }
    },

    // --- Equipment Workflows --- //
    showAddEquipmentModal() {
        this.showModal(Components.renderEquipmentForm());
    },

    showEditEquipment(id) {
        const eq = window.db.getEquipmentById(id);
        if (eq) this.showModal(Components.renderEquipmentForm(eq));
    },

    showEquipmentDetails(id) {
        const eq = window.db.getEquipmentById(id);
        if (eq) this.showModal(Components.renderEquipmentDetails(eq));
    },

    calculateMockAvailability() {
        const total = document.getElementById('eq-total').value;
        const availableEl = document.getElementById('eq-available');
        if (availableEl && total) {
            availableEl.value = total; // Mock for new equipment
        }
    },

    saveEquipmentForm() {
        const form = document.getElementById('equipment-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const categoryEl = document.getElementById('eq-category');
        const priceEl = document.getElementById('eq-price');
        const data = {
            equipmentId: document.getElementById('eq-id').value,
            equipmentName: document.getElementById('eq-name').value,
            totalQuantity: parseInt(document.getElementById('eq-total').value),
            conditionStatus: document.getElementById('eq-condition').value,
            notes: document.getElementById('eq-notes').value
        };

        if (categoryEl) {
            data.category = categoryEl.value;
        }

        if (priceEl) {
            data.unitPrice = parseFloat(priceEl.value || 0);
        }

        window.db.saveEquipment(data);
        this.closeModal();
        this.showToast('Equipment saved successfully!', 'success');
        this.handleRoute(); // Refresh view
        this.updateBadge();
    },

    deleteEquipment(id) {
        if(confirm("Are you sure you want to delete this equipment?")) {
            window.db.deleteEquipment(id);
            this.closeModal();
            this.showToast('Equipment deleted.', 'success');
            this.handleRoute();
            this.updateBadge();
        }
    },

    resetBorrowRecords() {
        if (confirm('Reset all borrowed items and clear all borrow records? This will set borrowed quantities back to zero.')) {
            window.db.resetBorrowRecords();
            this.showToast('Borrow records reset successfully.', 'success');
            this.handleRoute();
            this.updateBadge();
        }
    },

    resetAllEquipment() {
        if (confirm('This will delete ALL equipment and ALL borrow records, giving you a clean slate. This cannot be undone. Continue?')) {
            window.db.resetAllEquipment();
            this.showToast('All equipment and borrow records have been cleared.', 'success');
            this.handleRoute();
            this.updateBadge();
        }
    },

    deleteAllBorrowHistory() {
        if (confirm('This will permanently delete ALL borrow history records. This cannot be undone. Continue?')) {
            window.db.resetBorrowRecords();
            this.showToast('All borrow history has been deleted.', 'success');
            this.handleRoute();
            this.updateBadge();
        }
    },

    // --- Borrow/Return Workflows --- //
    showBorrowModal(eqId) {
        const eq = window.db.getEquipmentById(eqId);
        if (eq) this.showModal(Components.renderBorrowForm(eq));
    },

    // Handles category radio change — toggle ID No. required + Others text field
    onBorrowCategoryChange(radio) {
        const idNoInput = document.getElementById('borrow-id-no');
        const idNoLabel = document.getElementById('borrow-idno-label');
        const idNoHint  = document.getElementById('borrow-idno-hint');
        const otherInput = document.getElementById('borrow-category-other');

        if (radio.value === 'Student') {
            idNoInput.required = true;
            idNoInput.placeholder = 'e.g. 2024-00123';
            idNoLabel.textContent = 'ID No. *';
            idNoHint.textContent = 'Required for Students';
            idNoHint.style.color = 'var(--warning, #f59e0b)';
        } else {
            idNoInput.required = false;
            idNoInput.placeholder = 'Optional';
            idNoLabel.textContent = 'ID No.';
            idNoHint.textContent = 'Optional for ' + radio.value;
            idNoHint.style.color = '';
        }

        if (radio.value === 'Others') {
            otherInput.disabled = false;
            otherInput.required = true;
            otherInput.focus();
        } else {
            otherInput.disabled = true;
            otherInput.required = false;
            otherInput.value = '';
        }
    },

    submitBorrow() {
        const form = document.getElementById('borrow-form');

        // Check category selected
        const categoryRadio = document.querySelector('input[name="borrow-category"]:checked');
        if (!categoryRadio) {
            this.showToast('Please select a category (Faculty, Staff, Student, or Others).', 'error');
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const category = categoryRadio.value;
        const categoryOther = category === 'Others'
            ? document.getElementById('borrow-category-other').value.trim()
            : '';

        const data = {
            equipmentId: document.getElementById('borrow-eq-id').value,
            quantity: parseInt(document.getElementById('borrow-qty').value),
            borrowedBy: document.getElementById('borrow-user').value,
            category,
            categoryOther,
            idNo: document.getElementById('borrow-id-no').value,
            contactNumber: document.getElementById('borrow-contact').value,
            useFrom: document.getElementById('borrow-use-from').value,
            dueDate: document.getElementById('borrow-due').value,
            issuedBy: document.getElementById('borrow-issued-by').value,
            purpose: document.getElementById('borrow-purpose').value
        };

        window.db.borrowEquipment(data);
        this.closeModal();
        this.showToast('Equipment borrowed successfully.', 'success');
        this.handleRoute();
        this.updateBadge();
    },

    showReturnModal(borrowId) {
        const borrows = window.db.getBorrowRecords();
        const borrow = borrows.find(b => b.borrowId === borrowId);
        if (borrow) {
            const eq = window.db.getEquipmentById(borrow.equipmentId);
            this.showModal(Components.renderReturnForm(borrow, eq));
        }
    },

    submitReturn() {
        const form = document.getElementById('return-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const borrowId = document.getElementById('return-borrow-id').value;
        const data = {
            condition: document.getElementById('return-condition').value,
            notes: document.getElementById('return-notes').value
        };

        if (window.db.returnEquipment(borrowId, data)) {
            this.closeModal();
            this.showToast('Equipment returned successfully.', 'success');
            this.handleRoute();
            this.updateBadge();
        }
    },

    // --- Filtering --- //
    filterBorrowHistory() {
        const statusFilter = document.getElementById('history-filter')?.value || 'all';
        const monthFilter  = document.getElementById('history-month')?.value  || 'all';
        const yearFilter   = document.getElementById('history-year')?.value   || 'all';

        const allBorrows = window.db.getBorrowRecords();
        const now = new Date();

        let filtered = allBorrows;

        // Status filter
        switch (statusFilter) {
            case 'active':
                filtered = filtered.filter(b => !b.returnDate);
                break;
            case 'returned':
                filtered = filtered.filter(b => b.returnDate);
                break;
            case 'overdue':
                filtered = filtered.filter(b => !b.returnDate && b.dueDate && new Date(b.dueDate) < now);
                break;
        }

        // Month filter (based on borrowDate)
        if (monthFilter !== 'all') {
            filtered = filtered.filter(b => {
                if (!b.borrowDate) return false;
                return new Date(b.borrowDate).getMonth() + 1 === parseInt(monthFilter);
            });
        }

        // Year filter (based on borrowDate)
        if (yearFilter !== 'all') {
            filtered = filtered.filter(b => {
                if (!b.borrowDate) return false;
                return new Date(b.borrowDate).getFullYear() === parseInt(yearFilter);
            });
        }

        const viewContainer = document.getElementById('app-view');
        viewContainer.innerHTML = Components.renderBorrowHistory(filtered);

        // Restore all filter values after re-render
        setTimeout(() => {
            const s = document.getElementById('history-filter');
            const m = document.getElementById('history-month');
            const y = document.getElementById('history-year');
            if (s) s.value = statusFilter;
            if (m) m.value = monthFilter;
            if (y) y.value = yearFilter;
        }, 10);
    },

    // --- Toast Notifications --- //
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-triangle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

window.app = app;
