#!/bin/bash

# 🚀 SCRIPT AUTOMATICO SETUP DEPLOYMENT
# Implementa automaticamente le azioni obbligatorie per AGPL-3.0

set -e  # Exit on any error

echo "🚀 ASTROLOGY API - Setup Deployment AGPL-3.0"
echo "================================================"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica prerequisiti
print_step "Verifica prerequisiti..."

if ! command -v git &> /dev/null; then
    print_error "Git non è installato. Installa Git prima di continuare."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js non è installato. Installa Node.js prima di continuare."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm non è installato. Installa npm prima di continuare."
    exit 1
fi

print_success "Prerequisiti verificati"

# Verifica file obbligatori
print_step "Verifica file obbligatori..."

required_files=("LICENSE" "README.md" "package.json" "server.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "File obbligatorio mancante: $file"
        exit 1
    fi
done

print_success "File obbligatori presenti"

# Input utente per repository
echo ""
print_step "Configurazione Repository GitHub"
echo "Per rispettare la licenza AGPL-3.0, è OBBLIGATORIO creare un repository PUBBLICO."
echo ""

read -p "Inserisci il tuo username GitHub: " github_username
read -p "Inserisci il nome del repository (default: astro-api): " repo_name
repo_name=${repo_name:-astro-api}

repo_url="https://github.com/$github_username/$repo_name"
echo ""
print_warning "Repository URL: $repo_url"
print_warning "IMPORTANTE: Devi creare manualmente il repository su GitHub come PUBBLICO!"
echo ""
read -p "Hai già creato il repository pubblico su GitHub? (y/n): " repo_created

if [ "$repo_created" != "y" ] && [ "$repo_created" != "Y" ]; then
    print_error "Crea prima il repository pubblico su GitHub, poi riavvia questo script."
    echo "Istruzioni:"
    echo "1. Vai su https://github.com/new"
    echo "2. Repository name: $repo_name"
    echo "3. Description: Complete Astrology API with Swiss Ephemeris - AGPL-3.0"
    echo "4. Visibility: PUBLIC (obbligatorio!)"
    echo "5. Non inizializzare con README/LICENSE (abbiamo già i file)"
    exit 1
fi

# Aggiornamento URL nel codice
print_step "Aggiornamento URL repository nel codice..."

# Backup dei file originali
cp server.js server.js.backup
cp package.json package.json.backup

# Aggiorna server.js
if grep -q "your-username/astro-api" server.js; then
    sed -i.tmp "s|https://github.com/your-username/astro-api|$repo_url|g" server.js
    rm server.js.tmp
    print_success "URL aggiornato in server.js"
else
    print_warning "Pattern non trovato in server.js, verifica manualmente"
fi

# Aggiorna package.json
if grep -q '"repository"' package.json; then
    # Aggiorna repository esistente
    sed -i.tmp "s|\"url\": \".*\"|\"url\": \"$repo_url.git\"|g" package.json
    rm package.json.tmp
else
    # Aggiungi sezione repository
    sed -i.tmp '/"license": "AGPL-3.0",/a\
  "repository": {\
    "type": "git",\
    "url": "'$repo_url'.git"\
  },\
  "homepage": "'$repo_url'#readme",\
  "bugs": {\
    "url": "'$repo_url'/issues"\
  },' package.json
    rm package.json.tmp
fi

print_success "URL aggiornato in package.json"

# Inizializzazione Git
print_step "Configurazione Git..."

if [ ! -d ".git" ]; then
    git init
    print_success "Repository Git inizializzato"
fi

# Crea .gitignore se non esiste
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
node_modules/
logs/*.log
.env.local
*.tmp
*.backup
.DS_Store
EOF
    print_success ".gitignore creato"
fi

# Aggiungi remote se non esiste
if ! git remote get-url origin &> /dev/null; then
    git remote add origin "$repo_url.git"
    print_success "Remote origin aggiunto"
fi

# Commit e push
print_step "Commit e push del codice..."

git add .
git commit -m "Setup deployment - AGPL-3.0 compliance" || print_warning "Nessuna modifica da committare"

echo ""
print_warning "Ora verrà effettuato il push. Assicurati di aver configurato l'autenticazione GitHub."
read -p "Continuare con il push? (y/n): " do_push

if [ "$do_push" = "y" ] || [ "$do_push" = "Y" ]; then
    git branch -M main
    git push -u origin main
    print_success "Codice pushato su GitHub"
else
    print_warning "Push saltato. Ricorda di fare push manualmente:"
    echo "git branch -M main"
    echo "git push -u origin main"
fi

# Test endpoint license
print_step "Test endpoint license..."

if pgrep -f "node server.js" > /dev/null; then
    print_success "Server già in esecuzione"
else
    print_warning "Server non in esecuzione. Avviando..."
    npm install
    node server.js &
    SERVER_PID=$!
    sleep 3
fi

# Test dell'endpoint
if curl -s http://localhost:3000/v1/license > /dev/null; then
    print_success "Endpoint /v1/license funzionante"
    
    # Verifica contenuto
    license_response=$(curl -s http://localhost:3000/v1/license)
    if echo "$license_response" | grep -q "AGPL-3.0"; then
        print_success "Licenza AGPL-3.0 presente nella risposta"
    else
        print_error "Licenza AGPL-3.0 non trovata nella risposta"
    fi
    
    if echo "$license_response" | grep -q "$repo_url"; then
        print_success "URL repository presente nella risposta"
    else
        print_error "URL repository non trovato nella risposta"
    fi
else
    print_error "Endpoint /v1/license non raggiungibile"
fi

# Cleanup
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null || true
fi

# Creazione script di deployment per VPS
print_step "Creazione script deployment VPS..."

cat > deploy-vps.sh << 'EOF'
#!/bin/bash
# Script di deployment per VPS

echo "🚀 Deployment Astrology API su VPS"

# Verifica file obbligatori
required_files=("LICENSE" "package.json" "server.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ ERROR: File obbligatorio mancante: $file"
        exit 1
    fi
done

echo "✅ File obbligatori presenti"

# Installa dipendenze
echo "📦 Installazione dipendenze..."
npm install

# Configura PM2 se disponibile
if command -v pm2 &> /dev/null; then
    echo "🔧 Configurazione PM2..."
    pm2 start ecosystem.config.js || pm2 start server.js --name "astro-api"
    pm2 save
else
    echo "⚠️ PM2 non installato. Avvio server in background..."
    nohup node server.js > server.log 2>&1 &
    echo $! > server.pid
fi

echo "✅ Deployment completato"
echo "📄 Test endpoint: curl http://localhost:3000/v1/license"
EOF

chmod +x deploy-vps.sh
print_success "Script deploy-vps.sh creato"

# Riepilogo finale
echo ""
echo "🎉 SETUP COMPLETATO!"
echo "=================="
echo ""
print_success "✅ Repository URL aggiornati nel codice"
print_success "✅ Git configurato e codice pushato"
print_success "✅ Endpoint /v1/license testato"
print_success "✅ Script deployment VPS creato"
echo ""
print_warning "PROSSIMI PASSI:"
echo "1. Verifica che il repository sia pubblico: $repo_url"
echo "2. Trasferisci il codice sul VPS: git clone $repo_url"
echo "3. Sul VPS esegui: ./deploy-vps.sh"
echo "4. Testa: curl http://VPS-IP:3000/v1/license"
echo ""
print_warning "IMPORTANTE: Il repository DEVE rimanere pubblico per conformità AGPL-3.0!"
echo ""
echo "📖 Per istruzioni dettagliate: cat TUTORIAL_DEPLOYMENT.md"
echo "📋 Per checklist completa: cat DEPLOYMENT_CHECKLIST.md"