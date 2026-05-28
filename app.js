// Finance Tracker App
class FinanceTracker {
    constructor() {
        this.transactions = this.loadTransactions();
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setTodayDate();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('transactionForm').addEventListener('submit', (e) => this.addTransaction(e));
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('filterMonth').addEventListener('change', () => this.render());
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    addTransaction(e) {
        e.preventDefault();

        const transaction = {
            id: Date.now(),
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            type: document.getElementById('type').value,
            date: document.getElementById('date').value,
            description: document.getElementById('description').value
        };

        this.transactions.push(transaction);
        this.saveTransactions();
        this.render();
        document.getElementById('transactionForm').reset();
        this.setTodayDate();

        // Notifica
        this.showNotification('Transazione aggiunta con successo!');
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        this.render();
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    loadTransactions() {
        const data = localStorage.getItem('transactions');
        return data ? JSON.parse(data) : [];
    }

    clearAll() {
        if (confirm('Sei sicuro di voler eliminare tutte le transazioni?')) {
            this.transactions = [];
            this.saveTransactions();
            this.render();
            this.showNotification('Tutte le transazioni sono state cancellate!');
        }
    }

    getFilteredTransactions() {
        const filterMonth = document.getElementById('filterMonth').value;
        
        if (!filterMonth) {
            return this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return this.transactions
            .filter(t => t.date.startsWith(filterMonth))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    calculateStats() {
        let totalIncome = 0;
        let totalExpense = 0;

        this.transactions.forEach(t => {
            if (t.type === 'entrata') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });

        return {
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense
        };
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
        
        this.transactions.forEach(t => {
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
        this.transactions.forEach(t => {
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
            const sign = t.type === 'entrata' ? '' : '';

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
        if (this.transactions.length === 0) {
            alert('Nessuna transazione da esportare');
            return;
        }

        let csv = 'Data,Categoria,Tipo,Importo,Descrizione\n';

        this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(t => {
                const description = t.description.replace(/"/g, '""');
                csv += `${t.date},"${t.category}","${t.type}","€ ${t.amount.toFixed(2)}","${description}"\n`;
            });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-tracker-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('CSV esportato con successo!');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ade80;
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
