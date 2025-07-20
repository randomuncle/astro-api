# 🚀 Deployment Guide - Astrology API

## ✅ Stato Attuale

L'API funziona correttamente e utilizza **Swiss Ephemeris** per calcoli astronomici precisi. Il codice è pronto per la produzione.

### Caratteristiche Principali:
- ✅ Swiss Ephemeris integrato
- ✅ Cache Redis (opzionale)
- ✅ Rate limiting
- ✅ Logging strutturato
- ✅ Sicurezza con Helmet
- ✅ CORS configurabile
- ✅ API Key authentication

## 🔧 Configurazioni da Modificare per Produzione

### 1. File `.env` per VPS

Crea un nuovo `.env` per produzione:

```bash
# Produzione
NODE_ENV=production
PORT=3000
API_KEY=your-secure-api-key-here

# Redis (se disponibile)
REDIS_URL=redis://localhost:6379

# Path ephemeris su VPS
EPHE_PATH=/var/www/astrology-api/ephemeris

# CORS per il tuo dominio
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=warn
```

### 2. Rimuovi Configurazioni di Debug

Il codice attuale ha alcune configurazioni di sviluppo che puoi modificare:

- `LOG_LEVEL=info` → `LOG_LEVEL=warn` (meno verbose)
- `NODE_ENV=development` → `NODE_ENV=production`
- Aggiorna `ALLOWED_ORIGINS` con il tuo dominio

## 📦 Deployment su VPS

### Opzione 1: Deployment Manuale

```bash
# 1. Connettiti al VPS
ssh user@your-vps-ip

# 2. Installa Node.js (se non presente)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clona o carica il progetto
scp -r astrology-api-complete user@your-vps:/var/www/

# 4. Installa dipendenze
cd /var/www/astrology-api-complete
npm install --production

# 5. Configura .env per produzione
nano .env

# 6. Installa PM2 per gestione processi
npm install -g pm2

# 7. Avvia con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Opzione 2: Con Docker

Crea `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Crea `docker-compose.yml`:

```yaml
version: '3.8'
services:
  astrology-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./ephemeris:/app/ephemeris
    restart: unless-stopped
  
  redis:
    image: redis:alpine
    restart: unless-stopped
```

### Opzione 3: Con Nginx Reverse Proxy

Configura Nginx (`/etc/nginx/sites-available/astrology-api`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
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

## 🔒 Sicurezza per Produzione

1. **Cambia API Key**: Usa una chiave sicura e complessa
2. **Firewall**: Apri solo le porte necessarie (80, 443, 22)
3. **SSL**: Usa Let's Encrypt per HTTPS
4. **Updates**: Mantieni aggiornati Node.js e dipendenze

## 📊 Monitoraggio

```bash
# Verifica stato
pm2 status
pm2 logs astrology-api

# Restart se necessario
pm2 restart astrology-api

# Health check
curl http://your-domain/v1/health
```

## 🎯 Test Post-Deployment

```bash
# Test base
curl https://yourdomain.com/v1/health

# Test con API key
curl -X POST https://yourdomain.com/v1/daily-horoscope \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sign":"leo"}'
```

## 📝 Note Importanti

- **Swiss Ephemeris**: I file ephemeris (cartella `/ephemeris`) sono necessari per calcoli precisi
- **Redis**: Opzionale ma consigliato per performance migliori
- **PM2**: Gestisce restart automatici e clustering
- **Logs**: Controllabili con `pm2 logs` o file system

## 🆘 Troubleshooting

- **Port già in uso**: `sudo lsof -i :3000`
- **Permessi ephemeris**: `chmod -R 755 ephemeris/`
- **Memory issues**: Configura swap su VPS
- **CORS errors**: Verifica `ALLOWED_ORIGINS` in `.env`

L'API è production-ready! 🚀