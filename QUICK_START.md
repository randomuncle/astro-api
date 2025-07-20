# ⚡ QUICK START - Azioni Obbligatorie Deployment

## 🚀 Implementazione Rapida (5 minuti)

### Opzione 1: Script Automatico (Raccomandato)

```bash
# Esegui lo script automatico
./setup-deployment.sh
```

### Opzione 2: Comandi Manuali

```bash
# 1. Crea repository GitHub PUBBLICO su https://github.com/new
# Nome: astro-api
# Visibilità: PUBLIC (obbligatorio!)

# 2. Configura Git e push
git init
git remote add origin https://github.com/TUO-USERNAME/astro-api.git
git add .
git commit -m "Initial commit - AGPL-3.0 compliance"
git branch -M main
git push -u origin main

# 3. Aggiorna URL in server.js (riga ~1515)
sed -i 's|your-username/astro-api|TUO-USERNAME/astro-api|g' server.js

# 4. Aggiorna package.json
# Aggiungi nella sezione repository:
# "repository": {
#   "type": "git",
#   "url": "https://github.com/TUO-USERNAME/astro-api.git"
# }

# 5. Test endpoint
node server.js &
curl http://localhost:3000/v1/license
```

## ✅ Verifica Rapida

```bash
# Controlla che tutto sia OK
echo "🔍 Verifica conformità AGPL-3.0:"
echo "1. Repository pubblico: https://github.com/TUO-USERNAME/astro-api"
echo "2. File LICENSE presente: $(ls LICENSE 2>/dev/null && echo '✅' || echo '❌')"
echo "3. Endpoint license: $(curl -s http://localhost:3000/v1/license | grep -q 'AGPL-3.0' && echo '✅' || echo '❌')"
```

## 🚨 CRITICO - Prima del Deployment VPS

- [ ] ✅ Repository GitHub **PUBBLICO** creato
- [ ] ✅ URL aggiornati in `server.js` e `package.json`
- [ ] ✅ File `LICENSE` incluso nel deployment
- [ ] ✅ Endpoint `/v1/license` testato e funzionante

## 📞 Supporto

- **Tutorial completo**: `cat TUTORIAL_DEPLOYMENT.md`
- **Checklist dettagliata**: `cat DEPLOYMENT_CHECKLIST.md`
- **Script automatico**: `./setup-deployment.sh`

---

**⚠️ IMPORTANTE**: Il repository DEVE essere pubblico per rispettare la licenza AGPL-3.0!