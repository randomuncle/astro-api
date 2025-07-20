# Fix per Repository GitHub Troppo Grande

Il problema è che il repository contiene la storia dei file delle effemeridi (354 MB) che causano il fallimento del push su GitHub.

## Soluzione: Creare un nuovo repository pulito

### Opzione 1: Repository completamente nuovo

```bash
# 1. Backup del progetto attuale
cp -r /Users/carlocucuzza/Desktop/ASTRO-API /Users/carlocucuzza/Desktop/ASTRO-API-backup

# 2. Creare una nuova directory pulita
mkdir /Users/carlocucuzza/Desktop/ASTRO-API-clean
cd /Users/carlocucuzza/Desktop/ASTRO-API-clean

# 3. Copiare solo i file necessari (escludendo ephemeris)
cp -r /Users/carlocucuzza/Desktop/ASTRO-API/* . 2>/dev/null || true
rm -rf ephemeris/
rm -rf .git/

# 4. Inizializzare nuovo repository Git
git init
git add .
git commit -m "Initial commit - ASTRO API with AGPL-3.0 license (without ephemeris files)"

# 5. Collegare al repository GitHub
git remote add origin https://github.com/randomuncle/astro-api.git
git branch -M main
git push -u origin main --force
```

### Opzione 2: Usare Git LFS per file grandi

```bash
# Installare Git LFS
git lfs install

# Tracciare i file delle effemeridi con LFS
git lfs track "*.se1"
git lfs track "ephemeris/**"

# Aggiungere .gitattributes
git add .gitattributes
git commit -m "Add Git LFS tracking for ephemeris files"
```

### Opzione 3: Deployment senza ephemeris su GitHub

1. Mantenere il repository GitHub senza file ephemeris
2. Scaricare i file ephemeris direttamente sul VPS
3. Aggiungere script di download automatico

## Raccomandazione

Usa l'**Opzione 1** per semplicità. I file delle effemeridi possono essere scaricati direttamente sul VPS durante il deployment.