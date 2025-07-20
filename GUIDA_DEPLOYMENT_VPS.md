# 🚀 GUIDA DEPLOYMENT VPS - Trasferimento Completo API

## 📋 PREREQUISITI
- Accesso SSH al VPS
- Repository GitHub pubblico: https://github.com/randomuncle/astro-api
- Credenziali VPS (IP, username, password/chiave SSH)

---

## 🔴 FASE 1: CONNESSIONE E PULIZIA VPS

### 1.1 Connessione SSH
```bash
# Connettiti al VPS (sostituisci con i tuoi dati)
ssh username@TUO-VPS-IP

# Oppure con chiave SSH
ssh -i /path/to/your/key.pem username@TUO-VPS-IP
```

### 1.2 Backup Dati Esistenti (OPZIONALE)
```bash
# Se hai dati importanti, fai backup
sudo tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/ /home/
```

### 1.3 Pulizia Completa
```bash
# Ferma tutti i servizi Node.js/PM2
sudo pkill -f node
sudo pm2 kill 2>/dev/null || true

# Rimuovi directory web esistenti
sudo rm -rf /var/www/*
sudo rm -rf /home/*/astro-api 2>/dev/null || true
sudo rm -rf /home/*/ASTRO-API 2>/dev/null || true

# Pulisci processi orfani
sudo netstat -tulpn | grep :3000 | awk '{print $7}' | cut -d'/' -f1 | xargs sudo kill -9 2>/dev/null || true
```

---

## 🟡 FASE 2: INSTALLAZIONE DIPENDENZE

### 2.1 Aggiorna Sistema
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
# sudo yum update -y
```

### 2.2 Installa Node.js 18+
```bash
# Metodo 1: NodeSource Repository (RACCOMANDATO)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Metodo 2: Snap (alternativo)
# sudo snap install node --classic

# Verifica installazione
node --version  # Deve essere >= 18.0.0
npm --version
```

### 2.3 Installa PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 --version
```

### 2.4 Installa Git
```bash
sudo apt install git -y
git --version
```

---

## 🟢 FASE 3: CLONE E SETUP API

### 3.1 Clone Repository
```bash
# Vai nella directory home
cd ~

# Clona il repository
git clone https://github.com/randomuncle/astro-api.git
cd astro-api

# Verifica contenuto
ls -la
```

### 3.2 Installazione Dipendenze
```bash
# Installa dipendenze npm
npm install

# Verifica installazione Swiss Ephemeris
npm list sweph
```

### 3.3 Configurazione Environment
```bash
# Copia file environment
cp .env.production .env

# Modifica configurazione per VPS
nano .env
```

**Contenuto .env per VPS:**
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# API Security
API_KEY=your-secure-api-key-here

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Swiss Ephemeris
SWEPH_PATH=/home/username/astro-api/ephemeris

# Redis (se disponibile)
# REDIS_URL=redis://localhost:6379
```

---

## 🔵 FASE 4: CONFIGURAZIONE FIREWALL E RETE

### 4.1 Configurazione UFW (Ubuntu)
```bash
# Abilita firewall
sudo ufw enable

# Permetti SSH
sudo ufw allow ssh

# Permetti porta API
sudo ufw allow 3000

# Permetti HTTP/HTTPS (opzionale)
sudo ufw allow 80
sudo ufw allow 443

# Verifica regole
sudo ufw status
```

### 4.2 Test Locale
```bash
# Test rapido dell'API
node server.js &
SERVER_PID=$!

# Aspetta 3 secondi
sleep 3

# Test endpoint
curl http://localhost:3000/v1/health
curl http://localhost:3000/v1/license

# Ferma test
kill $SERVER_PID
```

---

## 🟣 FASE 5: DEPLOYMENT CON PM2

### 5.1 Configurazione PM2
```bash
# Crea file ecosystem per PM2
nano ecosystem.config.js
```

**Contenuto ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'astro-api',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 5.2 Avvio con PM2
```bash
# Crea directory logs
mkdir -p logs

# Avvia con PM2
pm2 start ecosystem.config.js

# Verifica status
pm2 status
pm2 logs astro-api --lines 20
```

### 5.3 Configurazione Auto-Start
```bash
# Salva configurazione PM2
pm2 save

# Genera script startup
pm2 startup

# Esegui il comando suggerito da PM2 (esempio):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u username --hp /home/username
```

---

## 🔶 FASE 6: VERIFICA E TEST

### 6.1 Test Endpoint Principali
```bash
# Health check
curl http://TUO-VPS-IP:3000/v1/health

# License endpoint (AGPL-3.0 compliance)
curl http://TUO-VPS-IP:3000/v1/license

# Info endpoint
curl http://TUO-VPS-IP:3000/v1/info

# Test geocoding
curl -X POST http://TUO-VPS-IP:3000/v1/geocoding \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"query": "Roma", "country": "IT"}'
```

### 6.2 Test Carta Natale
```bash
curl -X POST http://TUO-VPS-IP:3000/v1/natal-chart \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "birth_date": "1990-01-15",
    "birth_time": "14:30",
    "latitude": 41.9028,
    "longitude": 12.4964,
    "timezone": 1
  }'
```

### 6.3 Monitoraggio
```bash
# Monitoraggio PM2
pm2 monit

# Log in tempo reale
pm2 logs astro-api --lines 50 -f

# Statistiche sistema
htop
df -h
free -h
```

---

## 🔴 FASE 7: CONFIGURAZIONE NGINX (OPZIONALE)

### 7.1 Installazione Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 7.2 Configurazione Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/astro-api
```

**Contenuto configurazione Nginx:**
```nginx
server {
    listen 80;
    server_name TUO-DOMINIO.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.3 Attivazione Nginx
```bash
# Abilita sito
sudo ln -s /etc/nginx/sites-available/astro-api /etc/nginx/sites-enabled/

# Test configurazione
sudo nginx -t

# Riavvia Nginx
sudo systemctl restart nginx
```

---

## ✅ FASE 8: VERIFICA FINALE

### 8.1 Checklist Deployment
- [ ] ✅ VPS pulito e aggiornato
- [ ] ✅ Node.js 18+ installato
- [ ] ✅ Repository clonato
- [ ] ✅ Dipendenze installate
- [ ] ✅ File .env configurato
- [ ] ✅ PM2 configurato e avviato
- [ ] ✅ Firewall configurato
- [ ] ✅ Endpoint /v1/health funzionante
- [ ] ✅ Endpoint /v1/license accessibile (AGPL-3.0)
- [ ] ✅ API Key configurata
- [ ] ✅ Swiss Ephemeris funzionante

### 8.2 URL Finali
```
# Accesso diretto
http://TUO-VPS-IP:3000/v1/health
http://TUO-VPS-IP:3000/v1/license

# Con Nginx (se configurato)
http://TUO-DOMINIO.com/v1/health
http://TUO-DOMINIO.com/v1/license
```

### 8.3 Comandi Utili Post-Deployment
```bash
# Riavvio API
pm2 restart astro-api

# Aggiornamento codice
cd ~/astro-api
git pull origin main
npm install
pm2 restart astro-api

# Backup database geocoding
tar -czf geocoding-backup-$(date +%Y%m%d).tar.gz geocoding/

# Monitoraggio logs
tail -f logs/combined.log
```

---

## 🚨 TROUBLESHOOTING

### Problemi Comuni:

**1. Porta 3000 occupata:**
```bash
sudo netstat -tulpn | grep :3000
sudo kill -9 PID_DEL_PROCESSO
```

**2. Swiss Ephemeris non funziona:**
```bash
# Verifica file ephemeris
ls -la ephemeris/
# Reinstalla sweph
npm uninstall sweph
npm install sweph
```

**3. Permessi file:**
```bash
sudo chown -R $USER:$USER ~/astro-api
chmod +x server.js
```

**4. Memoria insufficiente:**
```bash
# Aggiungi swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 📞 SUPPORTO

- **Repository:** https://github.com/randomuncle/astro-api
- **Licenza:** AGPL-3.0 (endpoint /v1/license)
- **Logs:** `pm2 logs astro-api`
- **Status:** `pm2 status`

**🎯 API PRONTA PER PRODUZIONE! 🎯**