// Database Management System
class Database {
    constructor() {
        this.users = this.loadUsers();
    }

    // ===== USERS MANAGEMENT =====
    
    /**
     * Registra un nuovo utente
     * @param {string} name - Nome dell'utente
     * @param {string} email - Email univoca
     * @param {string} password - Password (salvata in plain text - in produzione usare bcrypt)
     * @returns {object} Utente registrato o errore
     */
    registerUser(name, email, password) {
        // Verifica se email esiste già
        if (this.users.some(u => u.email === email)) {
            return { success: false, message: 'Email già registrata' };
        }

        const user = {
            id: Date.now(),
            name: name,
            email: email,
            password: password, // ⚠️ In produzione: hashare con bcrypt
            createdAt: new Date().toISOString(),
            transactions: []
        };

        this.users.push(user);
        this.saveUsers();
        return { success: true, message: 'Registrazione completata', user };
    }

    /**
     * Accedi con email e password
     * @param {string} email - Email dell'utente
     * @param {string} password - Password
     * @returns {object} Utente autenticato o errore
     */
    loginUser(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            return { success: false, message: 'Email o password non corretti' };
        }

        return { success: true, message: 'Login riuscito', user };
    }

    /**
     * Trova un utente per ID
     * @param {number} userId - ID dell'utente
     * @returns {object} Utente trovato o null
     */
    getUserById(userId) {
        return this.users.find(u => u.id === userId);
    }

    /**
     * Aggiorna profilo utente
     * @param {number} userId - ID dell'utente
     * @param {object} updates - Campi da aggiornare
     */
    updateUser(userId, updates) {
        const user = this.getUserById(userId);
        if (!user) return { success: false, message: 'Utente non trovato' };

        Object.assign(user, updates);
        this.saveUsers();
        return { success: true, message: 'Profilo aggiornato', user };
    }

    /**
     * Elimina un utente
     * @param {number} userId - ID dell'utente
     */
    deleteUser(userId) {
        this.users = this.users.filter(u => u.id !== userId);
        this.saveUsers();
        return { success: true, message: 'Utente eliminato' };
    }

    // ===== TRANSACTIONS MANAGEMENT =====

    /**
     * Aggiungi una transazione a un utente
     * @param {number} userId - ID dell'utente
     * @param {object} transaction - Dati della transazione
     */
    addTransaction(userId, transaction) {
        const user = this.getUserById(userId);
        if (!user) return { success: false, message: 'Utente non trovato' };

        const tx = {
            id: Date.now(),
            ...transaction,
            createdAt: new Date().toISOString()
        };

        user.transactions.push(tx);
        this.saveUsers();
        return { success: true, message: 'Transazione aggiunta', transaction: tx };
    }

    /**
     * Ottieni tutte le transazioni di un utente
     * @param {number} userId - ID dell'utente
     */
    getUserTransactions(userId) {
        const user = this.getUserById(userId);
        return user ? user.transactions : [];
    }

    /**
     * Elimina una transazione
     * @param {number} userId - ID dell'utente
     * @param {number} transactionId - ID della transazione
     */
    deleteTransaction(userId, transactionId) {
        const user = this.getUserById(userId);
        if (!user) return { success: false, message: 'Utente non trovato' };

        user.transactions = user.transactions.filter(t => t.id !== transactionId);
        this.saveUsers();
        return { success: true, message: 'Transazione eliminata' };
    }

    /**
     * Elimina tutte le transazioni di un utente
     * @param {number} userId - ID dell'utente
     */
    clearUserTransactions(userId) {
        const user = this.getUserById(userId);
        if (!user) return { success: false, message: 'Utente non trovato' };

        user.transactions = [];
        this.saveUsers();
        return { success: true, message: 'Tutte le transazioni eliminate' };
    }

    /**
     * Calcola statistiche per un utente
     * @param {number} userId - ID dell'utente
     */
    calculateStats(userId) {
        const transactions = this.getUserTransactions(userId);
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'entrata') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });

        return {
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense,
            transactionCount: transactions.length
        };
    }

    /**
     * Esporta transazioni in CSV
     * @param {number} userId - ID dell'utente
     */
    exportToCSV(userId) {
        const transactions = this.getUserTransactions(userId);
        
        if (transactions.length === 0) {
            return '';
        }

        let csv = 'Data,Categoria,Tipo,Importo,Descrizione\n';

        transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(t => {
                const description = t.description.replace(/"/g, '""');
                csv += `${t.date},"${t.category}","${t.type}","€ ${t.amount.toFixed(2)}","${description}"\n`;
            });

        return csv;
    }

    // ===== STORAGE =====

    /**
     * Salva utenti su LocalStorage
     */
    saveUsers() {
        localStorage.setItem('finance_tracker_users', JSON.stringify(this.users));
    }

    /**
     * Carica utenti da LocalStorage
     */
    loadUsers() {
        const data = localStorage.getItem('finance_tracker_users');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Esporta tutto il database come JSON
     */
    exportDatabase() {
        return JSON.stringify(this.users, null, 2);
    }

    /**
     * Importa database da JSON
     */
    importDatabase(jsonData) {
        try {
            this.users = JSON.parse(jsonData);
            this.saveUsers();
            return { success: true, message: 'Database importato' };
        } catch (e) {
            return { success: false, message: 'Errore nell\'importazione' };
        }
    }

    /**
     * Cancella tutto il database
     */
    resetDatabase() {
        this.users = [];
        this.saveUsers();
        return { success: true, message: 'Database resettato' };
    }

    /**
     * Ottieni statistiche generali
     */
    getGlobalStats() {
        return {
            totalUsers: this.users.length,
            totalTransactions: this.users.reduce((sum, u) => sum + u.transactions.length, 0),
            totalIncome: this.users.reduce((sum, u) => {
                const userIncome = u.transactions
                    .filter(t => t.type === 'entrata')
                    .reduce((s, t) => s + t.amount, 0);
                return sum + userIncome;
            }, 0),
            totalExpense: this.users.reduce((sum, u) => {
                const userExpense = u.transactions
                    .filter(t => t.type === 'uscita')
                    .reduce((s, t) => s + t.amount, 0);
                return sum + userExpense;
            }, 0)
        };
    }
}

// Inizializza il database globale
const db = new Database();