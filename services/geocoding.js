/**
 * 🇮🇹 ITALIAN-OPTIMIZED GEOCODING SERVICE
 * Prioritizes Italian cities and searches alternate names properly
 */

const fs = require('fs');
const path = require('path');

class ItalianOptimizedGeocodingService {
  constructor() {
    this.cities = null;
    this.index = null;
    this.isLoaded = false;
    this.dbPath = path.join(__dirname, '..', 'geocoding', 'cities-optimized.json');
  }

  async loadDatabase() {
    try {
      if (!fs.existsSync(this.dbPath)) {
        throw new Error('Geocoding database not found. Run: npm run setup-geocoding');
      }

      console.log('📍 Loading geocoding database...');
      const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      
      this.cities = data.cities;
      this.index = data.index;
      this.isLoaded = true;
      
      console.log(`✅ Geocoding database loaded: ${this.cities.length} cities`);
      
      // Crea indice migliorato per nomi alternativi italiani
      this.createEnhancedIndex();
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to load geocoding database:', error.message);
      this.isLoaded = false;
      return false;
    }
  }

  // Crea un indice migliorato che include tutti i nomi alternativi
  createEnhancedIndex() {
    console.log('🔧 Creating enhanced index for Italian cities...');
    
    this.enhancedIndex = new Map();
    
    this.cities.forEach((city, cityIndex) => {
      const allNames = [city.name.toLowerCase()];
      
      // Aggiungi tutti i nomi alternativi
      if (city.alternate_names && Array.isArray(city.alternate_names)) {
        city.alternate_names.forEach(altName => {
          if (altName && typeof altName === 'string') {
            allNames.push(altName.toLowerCase().trim());
          }
        });
      }
      
      // Indicizza tutti i nomi
      allNames.forEach(name => {
        if (name.length >= 2) {
          if (!this.enhancedIndex.has(name)) {
            this.enhancedIndex.set(name, []);
          }
          this.enhancedIndex.get(name).push(cityIndex);
        }
      });
    });
    
    console.log(`✅ Enhanced index created with ${this.enhancedIndex.size} entries`);
  }

  // Ricerca ottimizzata per l'Italia
  searchCities(query, options = {}) {
    if (!this.isLoaded || !this.enhancedIndex) {
      throw new Error('Geocoding database not loaded or index not created');
    }

    const {
      limit = 10,
      country = null,
      minPopulation = 0,
      exactMatch = false,
      prioritizeItaly = true // Nuovo parametro per prioritizzare l'Italia
    } = options;

    const searchKey = query.toLowerCase().trim();
    
    if (searchKey.length < 2) {
      return [];
    }

    console.log(`🔍 Searching for: "${searchKey}" (prioritize Italy: ${prioritizeItaly})`);

    const cityIndices = new Set();
    let exactMatches = [];
    let startsWithMatches = [];
    let containsMatches = [];

    // 1. RICERCA ESATTA (nomi principali e alternativi)
    if (this.enhancedIndex.has(searchKey)) {
      const indices = this.enhancedIndex.get(searchKey);
      console.log(`✅ Found exact matches: ${indices.length}`);
      exactMatches = indices.map(i => this.cities[i]);
    }

    if (exactMatch) {
      return this.sortAndFilterResults(exactMatches, query, {
        limit, country, minPopulation, prioritizeItaly
      });
    }

    // 2. RICERCA CHE INIZIA CON (starts with)
    for (const [indexedName, indices] of this.enhancedIndex.entries()) {
      if (indexedName.startsWith(searchKey) && indexedName !== searchKey) {
        indices.forEach(i => {
          if (!cityIndices.has(i)) {
            startsWithMatches.push(this.cities[i]);
            cityIndices.add(i);
          }
        });
      }
    }

    // 3. RICERCA CHE CONTIENE (contains) - solo se pochi risultati
    if (exactMatches.length + startsWithMatches.length < limit * 2) {
      for (const [indexedName, indices] of this.enhancedIndex.entries()) {
        if (indexedName.includes(searchKey) && 
            !indexedName.startsWith(searchKey) && 
            indexedName !== searchKey) {
          indices.forEach(i => {
            if (!cityIndices.has(i)) {
              containsMatches.push(this.cities[i]);
              cityIndices.add(i);
            }
          });
        }
      }
    }

    // Combina tutti i risultati con priorità
    const allResults = [
      ...exactMatches,
      ...startsWithMatches, 
      ...containsMatches
    ];

    console.log(`📊 Found: ${exactMatches.length} exact, ${startsWithMatches.length} starts-with, ${containsMatches.length} contains`);

    return this.sortAndFilterResults(allResults, query, {
      limit, country, minPopulation, prioritizeItaly
    });
  }

  // Ordinamento e filtraggio ottimizzato per l'Italia
  sortAndFilterResults(results, query, options) {
    const { limit, country, minPopulation, prioritizeItaly } = options;
    
    // Applica filtri
    let filtered = results;
    
    if (country) {
      const countryFilter = country.toLowerCase();
      filtered = filtered.filter(city => 
        city.country.toLowerCase() === countryFilter
      );
      console.log(`🌍 Filtered by country "${country}": ${filtered.length} results`);
    }

    if (minPopulation > 0) {
      filtered = filtered.filter(city => city.pop >= minPopulation);
      console.log(`👥 Filtered by population >${minPopulation}: ${filtered.length} results`);
    }

    // ORDINAMENTO AVANZATO CON PRIORITÀ ITALIANA
    filtered.sort((a, b) => {
      const queryLower = query.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // 1. PRIORITÀ ASSOLUTA PER L'ITALIA
      if (prioritizeItaly) {
        const aIsItaly = a.country === 'IT';
        const bIsItaly = b.country === 'IT';
        
        if (aIsItaly && !bIsItaly) return -1;
        if (!aIsItaly && bIsItaly) return 1;
      }
      
      // 2. BOOST PER CITTÀ ITALIANE PRINCIPALI
      const italianCityBoost = {
        'milan': 4000000,      // Milano
        'milano': 4000000,
        'rome': 3500000,       // Roma
        'roma': 3500000,
        'naples': 1200000,     // Napoli
        'napoli': 1200000,
        'turin': 1000000,      // Torino
        'torino': 1000000,
        'florence': 800000,    // Firenze
        'firenze': 800000,
        'bologna': 700000,
        'genoa': 600000,       // Genova
        'genova': 600000,
        'venice': 500000,      // Venezia
        'venezia': 500000,
        'palermo': 700000,
        'catania': 400000,
        'bari': 350000,
        'messina': 300000,
        'verona': 300000,
        'trieste': 250000,
        'padova': 250000,
        'brescia': 250000
      };
      
      const aBoost = italianCityBoost[aName] || 0;
      const bBoost = italianCityBoost[bName] || 0;
      
      // 3. CONTROLLO CORRISPONDENZA ESATTA
      const aExactMatch = this.checkExactMatch(queryLower, a);
      const bExactMatch = this.checkExactMatch(queryLower, b);
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // 4. CONTROLLO STARTS WITH
      const aStartsWith = this.checkStartsWith(queryLower, a);
      const bStartsWith = this.checkStartsWith(queryLower, b);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // 5. SCORE FINALE: popolazione + boost italiano
      const aScore = a.pop + aBoost;
      const bScore = b.pop + bBoost;
      
      return bScore - aScore;
    });

    const finalResults = filtered.slice(0, limit);
    
    console.log(`🎯 Final results: ${finalResults.length}/${filtered.length} (showing top ${limit})`);
    if (finalResults.length > 0 && prioritizeItaly) {
      const italianCount = finalResults.filter(city => city.country === 'IT').length;
      console.log(`🇮🇹 Italian cities in results: ${italianCount}/${finalResults.length}`);
    }
    
    return finalResults;
  }

  // Verifica corrispondenza esatta (nome principale o alternativo)
  checkExactMatch(query, city) {
    if (city.name.toLowerCase() === query) return true;
    
    if (city.alternate_names && Array.isArray(city.alternate_names)) {
      return city.alternate_names.some(alt => 
        alt && alt.toLowerCase() === query
      );
    }
    
    return false;
  }

  // Verifica starts with (nome principale o alternativo)
  checkStartsWith(query, city) {
    if (city.name.toLowerCase().startsWith(query)) return true;
    
    if (city.alternate_names && Array.isArray(city.alternate_names)) {
      return city.alternate_names.some(alt => 
        alt && alt.toLowerCase().startsWith(query)
      );
    }
    
    return false;
  }

  // Geocoding principale con ottimizzazioni italiane
  async geocode(query, options = {}) {
    try {
      console.log(`🇮🇹 Italian-optimized geocoding for: "${query}"`);
      
      // Default: prioritizza sempre l'Italia a meno che non specificato diversamente
      const enhancedOptions = {
        prioritizeItaly: true,
        ...options
      };
      
      console.log(`📋 Options:`, enhancedOptions);
      
      const cities = this.searchCities(query, enhancedOptions);
      
      if (cities.length === 0) {
        console.log(`🔄 No results found, trying fallback searches...`);
        
        // Fallback 1: ricerca senza filtri di popolazione
        const fallbackCities = this.searchCities(query, {
          ...enhancedOptions,
          minPopulation: 0
        });
        
        if (fallbackCities.length === 0) {
          // Fallback 2: ricerca globale (non solo Italia)
          const globalCities = this.searchCities(query, {
            ...enhancedOptions,
            prioritizeItaly: false,
            minPopulation: 50000 // Almeno 50k abitanti per evitare paesini
          });
          
          if (globalCities.length > 0) {
            cities.push(...globalCities);
          }
        } else {
          cities.push(...fallbackCities);
        }
      }

      if (cities.length === 0) {
        return {
          success: false,
          error: 'No cities found',
          query: query,
          results: [],
          suggestions: this.getItalianSuggestions(query)
        };
      }

      const results = cities.map(city => ({
        name: city.name,
        country: city.country,
        latitude: city.lat,
        longitude: city.lon,
        population: city.pop,
        formatted: `${city.name}, ${city.country}`,
        confidence: this.calculateItalianConfidence(query, city),
        alternate_names: city.alternate_names || [],
        is_italian: city.country === 'IT'
      }));

      console.log(`✅ Geocoding successful: ${results.length} results`);
      
      return {
        success: true,
        query: query,
        results: results,
        count: results.length
      };

    } catch (error) {
      console.error(`❌ Geocoding error for "${query}":`, error.message);
      return {
        success: false,
        error: error.message,
        query: query,
        results: []
      };
    }
  }

  // Calcolo confidenza ottimizzato per nomi italiani
  calculateItalianConfidence(query, city) {
    const queryLower = query.toLowerCase().trim();
    const nameLower = city.name.toLowerCase();
    
    // BONUS PER CITTÀ ITALIANE
    const italianBonus = city.country === 'IT' ? 0.1 : 0;
    
    // 1. Corrispondenza esatta nel nome principale
    if (nameLower === queryLower) return Math.min(1.0, 0.95 + italianBonus);
    
    // 2. Corrispondenza esatta nei nomi alternativi (MOLTO IMPORTANTE!)
    if (city.alternate_names && Array.isArray(city.alternate_names)) {
      for (const alt of city.alternate_names) {
        if (alt && alt.toLowerCase() === queryLower) {
          return Math.min(1.0, 0.90 + italianBonus);
        }
      }
    }
    
    // 3. Mapping speciali per città italiane principali
    const italianMapping = {
      'milano': ['milan'],
      'milan': ['milano'],
      'roma': ['rome'],
      'rome': ['roma'],
      'firenze': ['florence'],
      'florence': ['firenze'],
      'napoli': ['naples'],
      'naples': ['napoli'],
      'torino': ['turin'],
      'turin': ['torino'],
      'venezia': ['venice'],
      'venice': ['venezia'],
      'genova': ['genoa'],
      'genoa': ['genova']
    };
    
    if (italianMapping[queryLower]) {
      const matches = italianMapping[queryLower];
      if (matches.includes(nameLower)) {
        return Math.min(1.0, 0.88 + italianBonus);
      }
      
      // Controlla anche nei nomi alternativi
      if (city.alternate_names) {
        for (const alt of city.alternate_names) {
          if (alt && matches.includes(alt.toLowerCase())) {
            return Math.min(1.0, 0.85 + italianBonus);
          }
        }
      }
    }
    
    // 4. Starts with nel nome principale
    if (nameLower.startsWith(queryLower)) {
      return Math.min(1.0, 0.75 + italianBonus);
    }
    
    // 5. Starts with nei nomi alternativi
    if (city.alternate_names && Array.isArray(city.alternate_names)) {
      for (const alt of city.alternate_names) {
        if (alt && alt.toLowerCase().startsWith(queryLower)) {
          return Math.min(1.0, 0.70 + italianBonus);
        }
      }
    }
    
    // 6. Contains nel nome principale
    if (nameLower.includes(queryLower)) {
      return Math.min(1.0, 0.60 + italianBonus);
    }
    
    // 7. Contains nei nomi alternativi
    if (city.alternate_names && Array.isArray(city.alternate_names)) {
      for (const alt of city.alternate_names) {
        if (alt && alt.toLowerCase().includes(queryLower)) {
          return Math.min(1.0, 0.55 + italianBonus);
        }
      }
    }
    
    // 8. Bonus popolazione per città grandi
    const populationBonus = Math.min(city.pop / 2000000, 0.15); // Max 0.15
    
    return Math.min(1.0, 0.45 + italianBonus + populationBonus);
  }

  // Suggerimenti ottimizzati per l'Italia
  getItalianSuggestions(query) {
    const suggestions = [];
    const searchKey = query.toLowerCase().trim();
    
    const italianCitySuggestions = {
      'milan': ['Milano', 'Milano IT', 'Milano Italia'],
      'milano': ['Milan', 'Milano Italia'],
      'rome': ['Roma', 'Roma IT', 'Roma Italia'],
      'roma': ['Rome', 'Roma Italia'],
      'florence': ['Firenze', 'Firenze IT'],
      'firenze': ['Florence', 'Firenze Italia'],
      'naples': ['Napoli', 'Napoli IT'],
      'napoli': ['Naples', 'Napoli Italia'],
      'turin': ['Torino', 'Torino IT'],
      'torino': ['Turin', 'Torino Italia'],
      'venice': ['Venezia', 'Venezia IT'],
      'venezia': ['Venice', 'Venezia Italia'],
      'genoa': ['Genova', 'Genova IT'],
      'genova': ['Genoa', 'Genova Italia']
    };
    
    if (italianCitySuggestions[searchKey]) {
      suggestions.push(...italianCitySuggestions[searchKey]);
    }
    
    // Aggiungi suggerimenti generici se non sono città italiane famose
    if (suggestions.length === 0) {
      suggestions.push(`${query} IT`, `${query} Italia`);
    }
    
    return suggestions;
  }

  // Reverse geocoding (mantenuto dall'originale)
  async reverseGeocode(latitude, longitude, options = {}) {
    try {
      const { radius = 50, prioritizeItaly = true } = options;
      
      if (!this.isLoaded) {
        throw new Error('Geocoding database not loaded');
      }

      const nearbyCities = this.cities.filter(city => {
        const distance = this.calculateDistance(
          latitude, longitude,
          city.lat, city.lon
        );
        return distance <= radius;
      });

      if (nearbyCities.length === 0) {
        return {
          success: false,
          error: 'No cities found within radius',
          latitude,
          longitude,
          results: []
        };
      }

      // Ordina con priorità per l'Italia
      nearbyCities.sort((a, b) => {
        if (prioritizeItaly) {
          const aIsItaly = a.country === 'IT';
          const bIsItaly = b.country === 'IT';
          
          if (aIsItaly && !bIsItaly) return -1;
          if (!aIsItaly && bIsItaly) return 1;
        }
        
        const distA = this.calculateDistance(latitude, longitude, a.lat, a.lon);
        const distB = this.calculateDistance(latitude, longitude, b.lat, b.lon);
        
        const scoreA = distA - (Math.log(a.pop + 1) * 0.1);
        const scoreB = distB - (Math.log(b.pop + 1) * 0.1);
        
        return scoreA - scoreB;
      });

      const results = nearbyCities.slice(0, 8).map(city => ({
        name: city.name,
        country: city.country,
        latitude: city.lat,
        longitude: city.lon,
        population: city.pop,
        formatted: `${city.name}, ${city.country}`,
        distance: this.calculateDistance(latitude, longitude, city.lat, city.lon),
        is_italian: city.country === 'IT'
      }));

      return {
        success: true,
        latitude,
        longitude,
        results: results,
        count: results.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        latitude,
        longitude,
        results: []
      };
    }
  }

  // Calcolo distanza (Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Statistiche con info italiane
  getStats() {
    if (!this.isLoaded) {
      return { loaded: false };
    }

    const countries = new Set(this.cities.map(c => c.country));
    const italianCities = this.cities.filter(c => c.country === 'IT');
    const totalPopulation = this.cities.reduce((sum, c) => sum + c.pop, 0);
    
    return {
      loaded: true,
      totalCities: this.cities.length,
      italianCities: italianCities.length,
      countries: countries.size,
      totalPopulation: totalPopulation,
      indexSize: this.enhancedIndex ? this.enhancedIndex.size : 0,
      memoryUsage: `~${Math.round(JSON.stringify(this.cities).length / 1024 / 1024)}MB`,
      optimization: 'Italian-prioritized'
    };
  }
}

// Crea istanza singleton
const italianGeocodingService = new ItalianOptimizedGeocodingService();

module.exports = italianGeocodingService;