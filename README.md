# 🌟 Astrology API - Local Test

## 🚀 Quick Start

```bash
# Installa dipendenze
npm install

# Avvia server
npm start

# Test API
curl http://localhost:3000/v1/health
```

## 🧪 Test Endpoints

### Health Check
```bash
curl http://localhost:3000/v1/health
```

### Oroscopo Giornaliero
```bash
curl -X POST http://localhost:3000/v1/daily-horoscope \
  -H "X-API-Key: test-api-key-123456789" \
  -H "Content-Type: application/json" \
  -d '{"sign":"leo"}'
```

### Carta Natale
```bash
curl -X POST http://localhost:3000/v1/natal-chart \
  -H "X-API-Key: test-api-key-123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "birth_date": "1990-05-15",
    "birth_time": "14:30:00",
    "latitude": 45.4642,
    "longitude": 9.1900
  }'
```

### Calcolo Ascendente
```bash
curl -X POST http://localhost:3000/v1/ascendant \
  -H "X-API-Key: test-api-key-123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "birth_date": "1990-05-15",
    "birth_time": "14:30:00",
    "latitude": 45.4642,
    "longitude": 9.1900
  }'
```

## 📊 Endpoint Disponibili

- `GET /v1/health` - Status check
- `GET /v1/info` - Info API
- `POST /v1/natal-chart` - Carta natale completa
- `POST /v1/planets` - Solo pianeti
- `POST /v1/houses` - Solo case
- `POST /v1/ascendant` - Solo ascendente
- `POST /v1/daily-horoscope` - Oroscopo giornaliero
- `POST /v1/weekly-horoscope` - Oroscopo settimanale
- `POST /v1/monthly-horoscope` - Oroscopo mensile
- `POST /v1/personal-forecast` - Previsioni personalizzate

## 🔑 API Key

Per i test locali usa: `test-api-key-123456789`

## ⚠️ Note

- Se Swiss Ephemeris non è installato, l'API usa dati mock
- Per calcoli reali installa: `npm install sweph`
- Redis opzionale per cache (se non disponibile, API funziona comunque)

## 📄 Licenza e Conformità Legale

### Licenza AGPL-3.0

Questo progetto è rilasciato sotto **GNU Affero General Public License v3.0 (AGPL-3.0)**.

**⚠️ IMPORTANTE - Implicazioni per il Deployment:**

1. **Uso Commerciale Permesso**: Puoi utilizzare questo software per scopi commerciali
2. **Obbligo di Condivisione del Codice**: Se distribuisci questo software su una rete (inclusi servizi web, API, SaaS), **DEVI** rendere disponibile il codice sorgente completo, incluse eventuali modifiche
3. **Licenza Virale**: Qualsiasi modifica o lavoro derivato deve essere rilasciato sotto la stessa licenza AGPL-3.0

### Componenti di Terze Parti

- **Swiss Ephemeris**: Copyright © Astrodienst AG, Svizzera (AGPL-3.0)
- **File Ephemeris**: Basati su JPL Ephemeris DE431, Copyright © 2014 Astrodienst AG

