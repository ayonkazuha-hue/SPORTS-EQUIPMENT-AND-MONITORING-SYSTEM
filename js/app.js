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
            case '#reports':
                viewContainer.innerHTML = Components.renderReports();
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
        if (badge) {
            badge.innerText = metrics.alerts.length;
            badge.style.display = metrics.alerts.length > 0 ? 'flex' : 'none';
        }
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

    // --- Borrow/Return Workflows --- //
    showBorrowModal(eqId) {
        const eq = window.db.getEquipmentById(eqId);
        if (eq) this.showModal(Components.renderBorrowForm(eq));
    },

    submitBorrow() {
        const form = document.getElementById('borrow-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = {
            equipmentId: document.getElementById('borrow-eq-id').value,
            quantity: parseInt(document.getElementById('borrow-qty').value),
            borrowedBy: document.getElementById('borrow-user').value,
            dueDate: document.getElementById('borrow-due').value
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
    filterEquipmentList() {
        const cat = document.getElementById('category-filter').value;
        const viewContainer = document.getElementById('app-view');
        const list = window.db.getEquipmentList();
        
        let filtered = list;
        if (cat !== 'All') {
            filtered = list.filter(e => e.category === cat);
        }
        
        viewContainer.innerHTML = Components.renderEquipmentList(filtered);
        // Retain dropdown value
        setTimeout(() => {
            const dropdown = document.getElementById('category-filter');
            if(dropdown) dropdown.value = cat;
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
