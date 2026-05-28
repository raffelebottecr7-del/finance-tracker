// Finance Tracker App with Authentication
class FinanceTracker {
    constructor() {
        this.currentUser = this.loadCurrentUser();
        this.chart = null;
        this.init();
    }

    init() {
        this.setupAuthEventListeners();
        this.setupAppEventListeners();
        
        if (this.currentUser) {
            this.showAppScreen();
        } else {
            this.showAuthScreen();
        }
    }

    // ===== AUTHENTICATION =====

    setupAuthEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
        });

        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));

        // Register
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
    }

    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Form`).classList.add('active');
    }

    handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const result = db.loginUser(email, password);

        if (!result.success) {
            this.showNotification(result.message, 'error');
            return;
        }

        this.currentUser = result.user;
        this.saveCurrentUser();
        this.showNotification('Login riuscito!', 'success');
        
        // Pulisci form
        document.getElementById('loginForm').reset();
        
        // Mostra app
        setTimeout(() => this.showAppScreen(), 500);
    }

    handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const password2 = document.getElementById('registerPassword2').value;

        if (password !== password2) {
            this.showNotification('Le password non coincidono', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('La password deve avere almeno 6 caratteri', 'error');
            return;
        }

        const result = db.registerUser(name, email, password);

        if (!result.success) {
            this.showNotification(result.message, 'error');
            return;
        }

        this.showNotification('Registrazione completata! Accedi ora.', 'success');
        
        // Pulisci form
        document.getElementById('registerForm').reset();
        
        // Torna al login
        setTimeout(() => this.switchAuthTab('login'), 500);
    }

    handleLogout() {
        if (confirm('Sei sicuro di voler uscire?')) {
            this.currentUser = null;
            this.saveCurrentUser();
            this.showAuthScreen();
            this.showNotification('Logout effettuato', 'success');
        }
    }

    saveCurrentUser() {
        localStorage.setItem('finance_tracker_current_user', JSON.stringify(this.currentUser));
    }

    loadCurrentUser() {
        const data = localStorage.getItem('finance_tracker_current_user');
        return data ? JSON.parse(data) : null;
    }

    // ===== UI =====

    showAuthScreen() {
        document.getElementById('authScreen').style.display = 'flex';
        document.getElementById('appScreen').style.display = 'none';
    }

    showAppScreen() {
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'block';
        
        document.getElementById('userName').textContent = this.currentUser.name;
        this.setTodayDate();
        this.render();
    }

    // ===== APP FUNCTIONALITY =====

    setupAppEventListeners() {
        document.getElementById('transactionForm')?.addEventListener('submit', (e) => this.addTransaction(e));
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportCSV());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearAll());
        document.getElementById('filterMonth')?.addEventListener('change', () => this.render());
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) dateInput.value = today;
    }

    addTransaction(e) {
        e.preventDefault();

        const transaction = {
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            type: document.getElementById('type').value,
            date: document.getElementById('date').value,
            description: document.getElementById('description').value
        };

        const result = db.addTransaction(this.currentUser.id, transaction);

        if (result.success) {
            this.currentUser = db.getUserById(this.currentUser.id);
            this.render();
            document.getElementById('transactionForm').reset();
            this.setTodayDate();
            this.showNotification('Transazione aggiunta con successo!', 'success');
        }
    }

    deleteTransaction(id) {
        if (confirm('Elimina questa transazione?')) {
            db.deleteTransaction(this.currentUser.id, id);
            this.currentUser = db.getUserById(this.currentUser.id);
            this.render();
        }
    }

    clearAll() {
        if (confirm('Sei sicuro di voler eliminare tutte le transazioni?')) {
            db.clearUserTransactions(this.currentUser.id);
            this.currentUser = db.getUserById(this.currentUser.id);
            this.render();
            this.showNotification('Tutte le transazioni sono state cancellate!', 'success');
        }
    }

    getFilteredTransactions() {
        const filterMonth = document.getElementById('filterMonth').value;
        
        if (!filterMonth) {
            return this.currentUser.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return this.currentUser.transactions
            .filter(t => t.date.startsWith(filterMonth))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    calculateStats() {
        return db.calculateStats(this.currentUser.id);
    }

    updateStats() {
        const stats = this.calculateStats();
        
        document.getElementById('totalIncome').textContent = `€ ${stats.income.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `€ ${stats.expense.toFixed(2)}`;
        
        const balanceEl = document.getElementById('totalBalance');
        balanceEl.textContent = `€ ${stats.balance.toFixed(2)}`;
        balanceEl.style.color = stats.balance >= 0 ? '#4ade80' : '#f87171';
    }

    updateChart() {
        const monthlyData = this.getMonthlyData();
        
        const ctx = document.getElementById('expenseChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Entrate',
                        data: monthlyData.income,
                        backgroundColor: '#4ade80',
                        borderRadius: 5
                    },
                    {
                        label: 'Uscite',
                        data: monthlyData.expense,
                        backgroundColor: '#f87171',
                        borderRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '€ ' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    getMonthlyData() {
        const months = {};
        
        this.currentUser.transactions.forEach(t => {
            const month = t.date.substring(0, 7);
            
            if (!months[month]) {
                months[month] = { income: 0, expense: 0 };
            }

            if (t.type === 'entrata') {
                months[month].income += t.amount;
            } else {
                months[month].expense += t.amount;
            }
        });

        const sortedMonths = Object.keys(months).sort();
        
        return {
            labels: sortedMonths.map(m => {
                const [year, month] = m.split('-');
                const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 
                                   'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
                return monthNames[parseInt(month) - 1] + ' ' + year;
            }),
            income: sortedMonths.map(m => months[m].income),
            expense: sortedMonths.map(m => months[m].expense)
        };
    }

    updateFilterMonths() {
        const months = new Set();
        this.currentUser.transactions.forEach(t => {
            months.add(t.date.substring(0, 7));
        });

        const filterSelect = document.getElementById('filterMonth');
        const currentValue = filterSelect.value;
        const sortedMonths = Array.from(months).sort().reverse();

        filterSelect.innerHTML = '<option value="">Tutti i mesi</option>';
        
        sortedMonths.forEach(month => {
            const [year, monthNum] = month.split('-');
            const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                               'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
            const option = document.createElement('option');
            option.value = month;
            option.textContent = monthNames[parseInt(monthNum) - 1] + ' ' + year;
            filterSelect.appendChild(option);
        });

        filterSelect.value = currentValue;
    }

    renderTransactions() {
        const filteredTransactions = this.getFilteredTransactions();
        const listContainer = document.getElementById('transactionsList');

        if (filteredTransactions.length === 0) {
            listContainer.innerHTML = '<div class="empty-state"><p>📭 Nessuna transazione trovata</p></div>';
            return;
        }

        listContainer.innerHTML = filteredTransactions.map(t => {
            const date = new Date(t.date);
            const formattedDate = date.toLocaleDateString('it-IT', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            const symbol = t.type === 'entrata' ? '+' : '-';

            return `
                <div class="transaction-item ${t.type}">
                    <div class="transaction-info">
                        <div class="transaction-category">${t.category}</div>
                        <div class="transaction-description">${t.description || 'Senza descrizione'}</div>
                        <div class="transaction-date">${formattedDate}</div>
                    </div>
                    <div class="transaction-amount ${t.type}">
                        ${symbol}€ ${t.amount.toFixed(2)}
                    </div>
                    <button class="delete-btn" onclick="app.deleteTransaction(${t.id})">Elimina</button>
                </div>
            `;
        }).join('');
    }

    exportCSV() {
        const csv = db.exportToCSV(this.currentUser.id);

        if (!csv) {
            this.showNotification('Nessuna transazione da esportare', 'error');
            return;
        }

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-tracker-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('CSV esportato con successo!', 'success');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#4ade80' : '#f87171';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    render() {
        this.updateStats();
        this.updateChart();
        this.renderTransactions();
        this.updateFilterMonths();
    }
}

// Animazioni CSS
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inizializza l'app
const app = new FinanceTracker();
