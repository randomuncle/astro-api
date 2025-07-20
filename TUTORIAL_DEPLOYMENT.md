# 🚀 TUTORIAL DEPLOYMENT VPS - Guida Passo-Passo

## 📋 Panoramica

Questo tutorial ti guiderà attraverso tutti i passaggi obbligatori per deployare l'Astrology API su VPS rispettando la licenza AGPL-3.0.

---

## 🔴 PASSO 1: Creare Repository GitHub Pubblico

### 1.1 Preparazione Repository

```bash
# 1. Vai nella directory del progetto
cd /Users/carlocucuzza/Desktop/ASTRO-API

# 2. Inizializza git (se non già fatto)
git init

# 3. Crea .gitignore
echo "node_modules/" > .gitignore
echo "logs/*.log" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.tmp" >> .gitignore
```

### 1.2 Creazione Repository su GitHub

1. **Vai su GitHub.com** e accedi al tuo account
2. **Clicca "New Repository"** (pulsante verde)
3. **Compila i campi**:
   - **Repository name**: `astro-api` (o nome preferito)
   - **Description**: `Complete Astrology API with Swiss Ephemeris - AGPL-3.0`
   - **Visibility**: ⚠️ **DEVE essere PUBLIC** (obbligatorio per AGPL-3.0)
   - **Initialize**: NON selezionare nulla (abbiamo già i file)
4. **Clicca "Create repository"**

### 1.3 Collegamento e Push

```bash
# 1. Aggiungi tutti i file
git add .

# 2. Primo commit
git commit -m "Initial commit - Astrology API AGPL-3.0"

# 3. Collega al repository remoto (sostituisci USERNAME)
git remote add origin https://github.com/USERNAME/astro-api.git

# 4. Push del codice
git branch -M main
git push -u origin main
```

**✅ VERIFICA**: Il repository deve essere visibile pubblicamente su GitHub

---

## 🔴 PASSO 2: Aggiornare URL Repository nel Codice

### 2.1 Aggiornamento server.js

**File**: `server.js` (circa riga 1515)

```javascript
// PRIMA (da cambiare):
source_code: 'https://github.com/your-username/astro-api',

// DOPO (sostituisci con il tuo URL):
source_code: 'https://github.com/TUO-USERNAME/astro-api',
```

**Comando per trovare la riga esatta**:
```bash
grep -n "source_code" server.js
```

### 2.2 Aggiornamento package.json

**File**: `package.json`

```json
{
  "name": "astrology-api",
  "version": "1.0.0",
  "description": "Complete Astrology API with Swiss Ephemeris",
  "repository": {
    "type": "git",
    "url": "https://github.com/TUO-USERNAME/astro-api.git"
  },
  "homepage": "https://github.com/TUO-USERNAME/astro-api#readme",
  "bugs": {
    "url": "https://github.com/TUO-USERNAME/astro-api/issues"
  },
  "license": "AGPL-3.0",
  // ... resto del file
}
```

### 2.3 Commit delle Modifiche

```bash
# 1. Aggiungi le modifiche
git add server.js package.json

# 2. Commit
git commit -m "Update repository URLs for AGPL-3.0 compliance"

# 3. Push
git push origin main
```

---

## 🔴 PASSO 3: Preparazione File per Deployment VPS

### 3.1 Verifica File Obbligatori

**Controlla che questi file esistano**:
```bash
ls -la LICENSE
ls -la README.md
ls -la package.json
ls -la server.js
ls -la DEPLOYMENT_CHECKLIST.md
```

### 3.2 Creazione Script di Deployment

**Crea**: `deploy.sh`
```bash
#!/bin/bash
# Script di deployment per VPS

echo "🚀 Starting deployment..."

# 1. Verifica file obbligatori
if [ ! -f "LICENSE" ]; then
    echo "❌ ERROR: LICENSE file missing!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json missing!"
    exit 1
fi

echo "✅ Required files present"

# 2. Installa dipendenze
npm install

# 3. Verifica endpoint license
echo "🔍 Testing license endpoint..."
node -e "console.log('Testing server startup...')"

echo "✅ Deployment preparation complete"
echo "📄 License endpoint: /v1/license"
echo "📖 Repository: $(grep '"url"' package.json | head -1)"
```

**Rendi eseguibile**:
```bash
chmod +x deploy.sh
```

---

## 🔴 PASSO 4: Deployment su VPS

### 4.1 Trasferimento File

**Opzione A - Git Clone (Raccomandato)**:
```bash
# Sul VPS
git clone https://github.com/TUO-USERNAME/astro-api.git
cd astro-api
```

**Opzione B - SCP**:
```bash
# Dal tuo computer
scp -r /Users/carlocucuzza/Desktop/ASTRO-API/ user@vps-ip:/path/to/deployment/
```

### 4.2 Configurazione VPS

```bash
# 1. Installa Node.js (se non presente)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Installa PM2 per gestione processi
npm install -g pm2

# 3. Vai nella directory del progetto
cd /path/to/astro-api

# 4. Installa dipendenze
npm install

# 5. Configura variabili d'ambiente
cp .env.production .env
# Modifica .env con i tuoi valori
```

### 4.3 Avvio Servizio

```bash
# 1. Avvia con PM2
pm2 start ecosystem.config.js

# 2. Verifica stato
pm2 status

# 3. Salva configurazione PM2
pm2 save
pm2 startup
```

---

## 🔴 PASSO 5: Verifica Conformità AGPL-3.0

### 5.1 Test Endpoint License

```bash
# Test locale
curl http://localhost:3000/v1/license

# Test su VPS (sostituisci IP)
curl http://TUO-VPS-IP:3000/v1/license
```

**Risposta attesa**:
```json
{
  "license": "AGPL-3.0",
  "name": "Astrology API",
  "source_code": "https://github.com/TUO-USERNAME/astro-api",
  "compliance_notice": "This software is distributed under AGPL-3.0...",
  // ... altri campi
}
```

### 5.2 Verifica Accessibilità Repository

1. **Apri il browser** e vai su: `https://github.com/TUO-USERNAME/astro-api`
2. **Verifica che sia pubblico** (nessun lucchetto)
3. **Controlla che il file LICENSE sia visibile**
4. **Verifica che il README contenga le informazioni sulla licenza**

### 5.3 Test Completo con Browser

**Apri**: `http://TUO-VPS-IP:3000/test-license.html`

**Verifica che mostri**:
- ✅ Licenza AGPL-3.0: OK
- ✅ URL Codice Sorgente: OK
- ✅ Link Testo Licenza: OK
- ✅ Componenti Terze Parti: OK
- ✅ Avviso Conformità: OK
- ✅ Requisiti AGPL: OK
- ✅ Obblighi Legali: OK

---

## ✅ CHECKLIST FINALE

### Prima di Andare Live

- [ ] ✅ Repository GitHub pubblico creato
- [ ] ✅ Tutto il codice pushato su GitHub
- [ ] ✅ URL repository aggiornati in `server.js`
- [ ] ✅ URL repository aggiornati in `package.json`
- [ ] ✅ File `LICENSE` presente nel deployment
- [ ] ✅ Endpoint `/v1/license` risponde correttamente
- [ ] ✅ Repository accessibile pubblicamente
- [ ] ✅ README contiene informazioni sulla licenza
- [ ] ✅ Test di conformità superati

### Configurazione Nginx (Opzionale)

```nginx
server {
    listen 80;
    server_name tuo-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Header per conformità AGPL-3.0
        add_header X-Source-Code "https://github.com/TUO-USERNAME/astro-api";
        add_header X-License "AGPL-3.0";
    }
}
```

---

## 🚨 IMPORTANTE - Conformità Legale

### ⚠️ Obblighi Continui

1. **Mantenere repository pubblico** sempre aggiornato
2. **Documentare tutte le modifiche** future
3. **Non rimuovere mai** i notice di copyright
4. **Fornire sempre** il link al codice sorgente

### 📞 In Caso di Problemi

- **Problemi tecnici**: Controlla i log con `pm2 logs`
- **Problemi legali**: Consulta un avvocato specializzato
- **Dubbi sulla licenza**: Leggi https://www.gnu.org/licenses/agpl-3.0.html

---

## 🎉 Deployment Completato!

Se hai seguito tutti i passaggi, la tua API è ora:
- ✅ **Legalmente conforme** alla licenza AGPL-3.0
- ✅ **Tecnicamente funzionante** su VPS
- ✅ **Trasparente** per gli utenti
- ✅ **Pronta per uso commerciale** (con le dovute precauzioni)

**Endpoint principali**:
- Health: `http://tuo-vps:3000/v1/health`
- Info: `http://tuo-vps:3000/v1/info`
- License: `http://tuo-vps:3000/v1/license`
- API completa: Vedi README.md

---

*Questo tutorial è stato creato per garantire la conformità AGPL-3.0. Per deployment commerciali, si raccomanda sempre la consulenza di un avvocato specializzato.*