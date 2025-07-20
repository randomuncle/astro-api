/**
 * 🛠️ SETUP SCRIPT SEMPLIFICATO - Astrology API
 * Per testing locale veloce
 */

const fs = require('fs');
const path = require('path');

console.log('🌟 Astrology API - Simple Setup');
console.log('==============================\n');

// 📁 Crea directory necessarie
const createDirectories = () => {
  const dirs = ['./logs', './ephemeris'];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } else {
      console.log(`📁 Directory exists: ${dir}`);
    }
  });
};

// 📋 Crea file README semplice
const createReadme = () => {
  const readmeContent = `# 🌟 Astrology API - Local Test

## 🚀 Quick Start

\`\`\`bash
# Installa dipendenze
npm install

# Avvia server
npm start

# Test API
curl http://localhost:3000/v1/health
\`\`\`

## 🧪 Test Endpoints

### Health Check
\`\`\`bash
curl http://localhost:3000/v1/health
\`\`\`

### Oroscopo Giornaliero
\`\`\`bash
curl -X POST http://localhost:3000/v1/daily-horoscope \\
  -H "X-API-Key: test-api-key-123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"sign":"leo"}'
\`\`\`

### Carta Natale
\`\`\`bash
curl -X POST http://localhost:3000/v1/natal-chart \\
  -H "X-API-Key: test-api-key-123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "birth_date": "1990-05-15",
    "birth_time": "14:30:00",
    "latitude": 45.4642,
    "longitude": 9.1900
  }'
\`\`\`

### Calcolo Ascendente
\`\`\`bash
curl -X POST http://localhost:3000/v1/ascendant \\
  -H "X-API-Key: test-api-key-123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "birth_date": "1990-05-15",
    "birth_time": "14:30:00",
    "latitude": 45.4642,
    "longitude": 9.1900
  }'
\`\`\`

## 📊 Endpoint Disponibili

- \`GET /v1/health\` - Status check
- \`GET /v1/info\` - Info API
- \`POST /v1/natal-chart\` - Carta natale completa
- \`POST /v1/planets\` - Solo pianeti
- \`POST /v1/houses\` - Solo case
- \`POST /v1/ascendant\` - Solo ascendente
- \`POST /v1/daily-horoscope\` - Oroscopo giornaliero
- \`POST /v1/weekly-horoscope\` - Oroscopo settimanale
- \`POST /v1/monthly-horoscope\` - Oroscopo mensile
- \`POST /v1/personal-forecast\` - Previsioni personalizzate

## 🔑 API Key

Per i test locali usa: \`test-api-key-123456789\`

## ⚠️ Note

- Se Swiss Ephemeris non è installato, l'API usa dati mock
- Per calcoli reali installa: \`npm install sweph\`
- Redis opzionale per cache (se non disponibile, API funziona comunque)
`;
  
  fs.writeFileSync('./README.md', readmeContent);
  console.log('✅ Created README.md');
};

// 📦 Controlla dependencies
const checkDependencies = () => {
  console.log('\n🔍 Checking dependencies...');
  
  try {
    require('express');
    console.log('✅ Express available');
  } catch (error) {
    console.log('❌ Express missing - run: npm install');
  }
  
  try {
    require('sweph');
    console.log('✅ Swiss Ephemeris available');
  } catch (error) {
    console.log('⚠️ Swiss Ephemeris missing - will use mock data');
    console.log('   To install: npm install sweph');
  }
  
  try {
    require('redis');
    console.log('✅ Redis client available');
  } catch (error) {
    console.log('⚠️ Redis client missing - caching disabled');
    console.log('   To install: npm install redis');
  }
};

// 🎯 Main setup function
const main = async () => {
  try {
    console.log('1. Creating directories...');
    createDirectories();
    
    console.log('\n2. Creating documentation...');
    createReadme();
    
    console.log('\n3. Checking dependencies...');
    checkDependencies();
    
    console.log('\n🎉 Setup completato!');
    console.log('\n📋 Prossimi passi:');
    console.log('1. npm install');
    console.log('2. npm start');
    console.log('3. curl http://localhost:3000/v1/health');
    console.log('\n🔥 Ready to test your Astrology API!');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Avvia setup
main();