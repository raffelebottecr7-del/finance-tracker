# 💰 Finance Tracker

Un'app semplice e intuitiva per tracciare entrate e uscite, analizzare le spese con grafici e gestire il budget personale.

## ✨ Funzionalità

- 📊 **Inserimento Spese** - Aggiungi entrate e uscite con categorie personalizzate
- 📈 **Grafici Mensili** - Visualizza il trend delle tue spese mensilmente
- 🏷️ **Categorie** - Organizza le transazioni per categoria (Alimentari, Trasporto, Stipendio, ecc.)
- 💾 **Salvataggio Automatico** - I dati vengono salvati in LocalStorage
- 📥 **Esportazione CSV** - Scarica le tue transazioni in formato Excel
- 📱 **Responsive** - Funziona su desktop, tablet e mobile

## 🚀 Come Usarla

1. **Clona il repository**
   ```bash
   git clone https://github.com/raffelebottecr7-del/finance-tracker.git
   cd finance-tracker
   ```

2. **Apri il file `index.html` nel browser**
   - Oppure usa un server locale: `python -m http.server 8000`

3. **Inizia a aggiungere transazioni!**

## 📋 Categorie Disponibili

- 🛒 Alimentari
- 🚗 Trasporto
- 🎮 Intrattenimento
- 💵 Stipendio
- ⚡ Utilities
- 🏥 Salute
- 📌 Altro

## 💡 Come Funziona

### Aggiungere una Transazione
1. Inserisci l'importo
2. Seleziona una categoria
3. Scegli se è entrata o uscita
4. Aggiungi una descrizione (opzionale)
5. Premi "Aggiungi"

### Visualizzare le Statistiche
- **Entrate totali**: Somma di tutte le entrate
- **Uscite totali**: Somma di tutte le uscite
- **Bilancio**: Differenza tra entrate e uscite

### Esportare i Dati
- Clicca il pulsante "📥 Esporta CSV"
- Scaricherai un file con tutte le transazioni

## 🗂️ Struttura del Progetto

```
finance-tracker/
├── index.html      # Struttura HTML
├── style.css       # Stili CSS
├── app.js          # Logica JavaScript
└── README.md       # Questo file
```

## 🔧 Tecnologie Utilizzate

- **HTML5** - Struttura
- **CSS3** - Styling con gradient e animazioni
- **JavaScript (vanilla)** - Logica dell'app
- **Chart.js** - Grafici interattivi
- **LocalStorage** - Persistenza dei dati

## 💾 Salvataggio Dati

I tuoi dati vengono salvati automaticamente nel browser usando **LocalStorage**. Non c'è necessità di un database esterno!

## 📝 Note

- I dati sono salvati localmente nel tuo browser
- Se cancelli i dati del browser, perderai le transazioni
- È consigliabile esportare i dati regolarmente come backup

---

**Creato con ❤️ da Raffaele Bottecchia**
