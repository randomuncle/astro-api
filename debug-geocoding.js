#!/usr/bin/env node

const geocodingService = require('./services/geocoding');

async function debugGeocodingService() {
    try {
        console.log('🔍 Debug Geocoding Service for Milano');
        console.log('=====================================\n');
        
        // Carica il database
        console.log('📊 Loading database...');
        const loaded = await geocodingService.loadDatabase();
        
        if (!loaded) {
            console.error('❌ Failed to load database');
            return;
        }
        
        console.log('✅ Database loaded successfully\n');
        
        // Ottieni statistiche
        const stats = geocodingService.getStats();
        console.log('📈 Database Statistics:');
        console.log(`   - Total cities: ${stats.totalCities}`);
        console.log(`   - Countries: ${stats.countries}`);
        console.log(`   - Index size: ${stats.indexSize}`);
        console.log(`   - Memory usage: ${stats.memoryUsage}\n`);
        
        // Test diverse query per Milano
        const testQueries = [
            'Milano',
            'Milan', 
            'Milano IT',
            'Milano Italy',
            'Milan Italy',
            'Milan IT',
            'italy milano'
        ];
        
        for (const query of testQueries) {
            console.log(`🔎 Testing query: "${query}"`);
            console.log('-'.repeat(50));
            
            const result = await geocodingService.geocode(query, { 
                limit: 5,
                country: query.includes('IT') ? 'IT' : null
            });
            
            if (result.success && result.results.length > 0) {
                console.log(`✅ Found ${result.results.length} results:`);
                result.results.forEach((city, i) => {
                    console.log(`   ${i+1}. ${city.name}, ${city.country}`);
                    console.log(`      Population: ${city.population.toLocaleString()}`);
                    console.log(`      Coordinates: ${city.latitude}, ${city.longitude}`);
                    console.log(`      Confidence: ${(city.confidence * 100).toFixed(1)}%`);
                    if (city.alternate_names && city.alternate_names.length > 0) {
                        console.log(`      Alt names: ${city.alternate_names.slice(0, 3).join(', ')}`);
                    }
                    console.log('');
                });
            } else {
                console.log(`❌ No results found`);
                if (result.error) {
                    console.log(`   Error: ${result.error}`);
                }
            }
            console.log('');
        }
        
        // Test specifico per l'Italia
        console.log('🇮🇹 Testing Italy-specific search...');
        console.log('-'.repeat(50));
        
        const italyResult = await geocodingService.geocode('Milan', { 
            country: 'IT',
            limit: 10
        });
        
        if (italyResult.success && italyResult.results.length > 0) {
            console.log(`✅ Found ${italyResult.results.length} Italian results:`);
            italyResult.results.forEach((city, i) => {
                console.log(`   ${i+1}. ${city.name}, ${city.country} (${city.population.toLocaleString()})`);
            });
        } else {
            console.log('❌ No Italian cities found for "Milan"');
        }
        
        // Test reverse geocoding per le coordinate di Milano
        console.log('\n🌍 Testing reverse geocoding for Milano coordinates...');
        console.log('-'.repeat(60));
        
        // Coordinate note di Milano: 45.4642, 9.1900
        const reverseResult = await geocodingService.reverseGeocode(45.4642, 9.1900, {
            radius: 20
        });
        
        if (reverseResult.success && reverseResult.results.length > 0) {
            console.log(`✅ Reverse geocoding found ${reverseResult.results.length} cities near Milano:`);
            reverseResult.results.forEach((city, i) => {
                console.log(`   ${i+1}. ${city.name}, ${city.country}`);
                console.log(`      Distance: ${city.distance.toFixed(2)} km`);
                console.log(`      Population: ${city.population.toLocaleString()}`);
            });
        } else {
            console.log('❌ No cities found near Milano coordinates');
        }
        
    } catch (error) {
        console.error('💥 Error during debugging:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Esegui il debug
debugGeocodingService().then(() => {
    console.log('\n🏁 Debug completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
});
