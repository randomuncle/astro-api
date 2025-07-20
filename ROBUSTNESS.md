# 🛡️ Robustezza e Gestione Errori - Astrology API

## 📋 Panoramica delle Migliorie

Questo documento descrive tutte le migliorie implementate per rendere l'API più robusta e resistente agli errori in edge case.

## 🔧 Middleware di Sicurezza Implementati

### 1. ⏱️ Request Timeout Middleware
- **Scopo**: Previene richieste che si bloccano indefinitamente
- **Timeout predefinito**: 30 secondi (configurabile via `REQUEST_TIMEOUT`)
- **Comportamento**: Termina automaticamente le richieste che superano il timeout
- **Risposta**: HTTP 408 Request Timeout

### 2. 🚦 Rate Limiting Middleware
- **Scopo**: Previene abusi e attacchi DDoS
- **Limite predefinito**: 100 richieste/minuto per IP+API key
- **Configurabile**: `RATE_LIMIT_WINDOW` e `RATE_LIMIT_MAX`
- **Headers**: Aggiunge header `X-RateLimit-*` per informare il client
- **Risposta**: HTTP 429 Too Many Requests

### 3. 🛡️ Input Sanitization Middleware
- **Scopo**: Previene attacchi di injection e XSS
- **Sanitizzazione**: Rimuove caratteri HTML/XML e di controllo
- **Validazione**: Limita la lunghezza degli input (max 1000 caratteri)
- **Protezione**: Previene ricorsione profonda negli oggetti
- **Controllo dimensioni**: Verifica la dimensione delle richieste

### 4. 🔐 Enhanced API Key Authentication
- **Validazione formato**: Controlla lunghezza minima e tipo
- **Logging dettagliato**: Registra tentativi di accesso non autorizzati
- **Error handling**: Gestisce errori nel processo di autenticazione
- **Informazioni sicurezza**: Nasconde la chiave API nei log

## 🧮 Validazione Robusta delle Funzioni di Calcolo

### 1. validateDateInput()
- Valida formato data (YYYY-MM-DD)
- Valida formato ora (HH:MM o HH:MM:SS)
- Controlla range validi per anno (1800-2200), mese, giorno, ore, minuti, secondi
- Gestisce errori di parsing

### 2. validateCoordinates()
- Valida che latitudine e longitudine siano numeri
- Controlla range: latitudine (-90, 90), longitudine (-180, 180)
- Gestisce valori NaN e non numerici

### 3. calculateJulianDay() - Enhanced
- Validazione input completa
- Controllo timezone (-12, +14)
- Verifica disponibilità Swiss Ephemeris
- Gestione errori di calcolo
- Logging dettagliato

### 4. calculatePlanets() - Enhanced
- Validazione Julian Day
- Controllo inizializzazione Swiss Ephemeris
- Validazione ID pianeti
- Controllo struttura risultati
- Gestione pianeti mancanti
- Re-throwing errori per pianeti richiesti

### 5. calculateHouses() - Enhanced
- Validazione input (JD, coordinate, sistema case)
- Controllo risultati Swiss Ephemeris
- Validazione cuspidi case e punti speciali
- Normalizzazione longitudini (0-360°)
- Warning per discrepanze ascendente/prima casa

### 6. calculateAspects() - Enhanced
- Validazione oggetto pianeti
- Controllo dati individuali pianeti
- Normalizzazione longitudini
- Validazione differenze angolari
- Gestione errori per coppie di pianeti
- Ordinamento aspetti per orb

### 7. getZodiacSign() - Enhanced
- Validazione input longitudine
- Normalizzazione longitudine (0-360°)
- Validazione indice segno calcolato
- Fallback sicuro ('Unknown') in caso di errore

### 8. assignPlanetsToHouses() - Enhanced
- Validazione oggetti pianeti e case
- Normalizzazione longitudini
- Controllo dati case richiesti
- Logging assegnazioni
- Fallback prima casa per pianeti non assegnati
- Gestione errori individuali pianeti

## 🌐 Gestione Errori Globale

### Enhanced Error Handler
- **ValidationError**: Errori di validazione input
- **SyntaxError**: Errori di parsing JSON
- **ECONNREFUSED**: Errori di connessione
- **TimeoutError**: Errori di timeout
- **Errori generici**: Gestione catch-all
- **Logging strutturato**: Log dettagliati per debugging

### Process Error Handlers
- **uncaughtException**: Gestione eccezioni non catturate
- **unhandledRejection**: Gestione promise rifiutate
- **Graceful shutdown**: Chiusura pulita del server

## 📊 Endpoint API Migliorati

### /v1/natal-chart - Enhanced
- Validazione robusta input (data, ora, coordinate)
- Gestione errori per ogni fase di calcolo
- Try-catch specifici per Julian Day, pianeti, case, aspetti
- Caching con gestione errori
- Logging dettagliato

### Tutti gli endpoint includono:
- Validazione input completa
- Gestione errori strutturata
- Logging delle operazioni
- Risposte di errore standardizzate

## ⚙️ Configurazione Ambiente

### Variabili di Sicurezza
```env
# Timeout richieste (ms)
REQUEST_TIMEOUT=30000

# Rate limiting
RATE_LIMIT_WINDOW=60000  # Finestra tempo (ms)
RATE_LIMIT_MAX=100       # Max richieste per finestra

# Dimensione massima richiesta (bytes)
MAX_REQUEST_SIZE=10485760  # 10MB

# Cache
CACHE_TTL=3600           # TTL cache (secondi)
MAX_CACHE_SIZE=1000      # Max elementi in cache
```

### Configurazione Produzione
- Rate limiting più restrittivo (60 req/min)
- Dimensione richiesta ridotta (5MB)
- Cache più grande (5000 elementi)
- Log level 'warn' per performance

## 🚨 Monitoraggio e Logging

### Tipi di Log
- **Error**: Errori critici e eccezioni
- **Warn**: Rate limiting, timeout, tentativi non autorizzati
- **Info**: Operazioni completate, startup server
- **Debug**: Dettagli calcoli e autenticazione

### Metriche Monitorate
- Tempo risposta endpoint
- Rate di errori
- Utilizzo cache
- Tentativi accesso non autorizzati
- Timeout richieste

## 🔍 Testing Edge Cases

### Casi Testati
1. **Date invalide**: Formati errati, date future/passate estreme
2. **Coordinate invalide**: Valori fuori range, NaN, stringhe
3. **Timeout**: Richieste che superano il limite di tempo
4. **Rate limiting**: Superamento limiti di richieste
5. **Input malformati**: JSON invalidi, caratteri speciali
6. **Swiss Ephemeris**: Gestione quando non disponibile
7. **Cache errors**: Errori Redis, cache corrotta
8. **Memory leaks**: Gestione memoria per richieste multiple

## 📈 Performance e Scalabilità

### Ottimizzazioni
- Cache intelligente con TTL configurabile
- Rate limiting per prevenire sovraccarico
- Timeout per liberare risorse
- Sanitizzazione efficiente input
- Logging asincrono

### Scalabilità
- Supporto clustering PM2
- Cache Redis distribuita
- Rate limiting per IP+API key
- Gestione memoria ottimizzata

## 🛠️ Manutenzione

### Checklist Produzione
- [ ] Configurare variabili ambiente produzione
- [ ] Testare tutti gli endpoint con dati edge case
- [ ] Monitorare log per errori ricorrenti
- [ ] Verificare performance cache
- [ ] Controllare rate limiting
- [ ] Testare graceful shutdown
- [ ] Verificare gestione memoria

### Aggiornamenti Futuri
- Implementazione circuit breaker
- Metrics avanzate (Prometheus)
- Health checks più dettagliati
- Backup automatico cache
- Load balancing support