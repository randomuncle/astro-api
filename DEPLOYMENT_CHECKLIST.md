# 📋 CHECKLIST DEPLOYMENT VPS - CONFORMITÀ AGPL-3.0

## ⚠️ REQUISITI LEGALI OBBLIGATORI

### ✅ Licenza e Copyright
- [x] File `LICENSE` creato con testo AGPL-3.0 completo
- [x] Copyright notices preservati in tutti i file
- [x] Endpoint `/v1/license` implementato per trasparenza
- [x] Documentazione licenza aggiunta al README.md
- [ ] **TODO**: Aggiornare URL repository nel codice

### ✅ Conformità AGPL-3.0
- [x] Codice sorgente deve essere pubblicamente accessibile
- [x] Tutte le modifiche devono essere documentate
- [x] Link al repository deve essere fornito agli utenti
- [x] Avvisi di licenza devono rimanere visibili

## 🔧 REQUISITI TECNICI

### ✅ Repository Pubblico
- [ ] **CRITICO**: Creare repository GitHub/GitLab pubblico
- [ ] **CRITICO**: Caricare tutto il codice sorgente
- [ ] **CRITICO**: Aggiornare URL nel file `server.js` (riga ~1515)
- [ ] **CRITICO**: Aggiornare URL nel file `package.json`
- [ ] Includere documentazione completa
- [ ] Aggiungere istruzioni di installazione

### ✅ Configurazione Server
- [ ] Verificare che il file `LICENSE` sia incluso nel deployment
- [ ] Configurare variabili d'ambiente (`.env`)
- [ ] Testare endpoint `/v1/license` sul VPS
- [ ] Implementare logging delle richieste per compliance

### ✅ Notifiche agli Utenti
- [x] Endpoint `/v1/license` fornisce informazioni complete
- [x] Endpoint `/v1/info` include riferimenti alla licenza
- [ ] **RACCOMANDATO**: Aggiungere header HTTP con link al codice sorgente
- [ ] **RACCOMANDATO**: Pagina web con informazioni sulla licenza

## 🚨 RISCHI E ALTERNATIVE

### ❌ Rischi di Non Conformità
- **Violazione copyright Swiss Ephemeris/Astrodienst AG**
- **Azioni legali per violazione AGPL-3.0**
- **Richieste di cessazione attività**
- **Danni economici e reputazionali**

### 💡 Alternative Legali
1. **Licenza Commerciale Swiss Ephemeris**
   - Contattare Astrodienst AG per licenza professionale
   - Costo: da valutare con Astrodienst
   - Beneficio: nessun obbligo di disclosure del codice

2. **Sostituzione Libreria**
   - Usare alternative con licenze MIT/BSD
   - Esempio: `astronomia` (meno precisa)
   - Beneficio: maggiore libertà commerciale

## 📝 AZIONI IMMEDIATE RICHIESTE

### 🔴 PRIMA DEL DEPLOYMENT (OBBLIGATORIO)
1. **Creare repository pubblico**
2. **Aggiornare tutti gli URL nel codice**
3. **Verificare che il file LICENSE sia incluso**
4. **Testare endpoint `/v1/license`**
5. **Documentare eventuali modifiche apportate**

### 🟡 RACCOMANDAZIONI AGGIUNTIVE
1. **Consultare avvocato specializzato** in IP prima del lancio commerciale
2. **Implementare sistema di notifica automatica** della licenza
3. **Creare pagina dedicata** con informazioni legali
4. **Monitorare compliance** durante l'operatività

## 📞 CONTATTI UTILI

- **Astrodienst AG**: https://www.astro.com/contact
- **AGPL-3.0 FAQ**: https://www.gnu.org/licenses/gpl-faq.html
- **Swiss Ephemeris License**: https://www.astro.com/swisseph/

## ⚖️ DISCLAIMER LEGALE

Questo documento fornisce indicazioni generali ma **NON costituisce consulenza legale**. 
Per deployment commerciali, è **FORTEMENTE RACCOMANDATO** consultare un avvocato specializzato in proprietà intellettuale e licenze software.

---

**Data creazione**: $(date)
**Versione**: 1.0
**Stato**: ⚠️ AZIONE RICHIESTA PRIMA DEL DEPLOYMENT