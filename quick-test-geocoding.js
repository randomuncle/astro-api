#!/usr/bin/env node

// Test veloce per verificare il nuovo geocoding service
const geocodingService = require('./services/geocoding');

async function quickTest() {
    console.log('🧪 QUICK TEST - Italian Optimized Geocoding');
    console.log('============================================\n');
    
    try {
        // Carica il database
        const loaded = await geocodingService.loadDatabase();
        if (!loaded) {
            console.error('❌ Failed to load database');
            return;
        }
        
        // Test con Milano
        console.log('🔍 Testing "Milano"...');
        const milanResult = await geocodingService.geocode('Milano', { limit: 5 });
        
        if (milanResult.success) {
            console.log(`✅ Found ${milanResult.results.length} results for Milano:`);
            milanResult.results.forEach((city, i) => {
                console.log(`   ${i+1}. ${city.name}, ${city.country} (${city.population.toLocaleString()}) - ${city.confidence.toFixed(2)}`);
            });
        } else {
            console.log('❌ No results for Milano');
        }
        
        console.log('\n' + '-'.repeat(50) + '\n');
        
        // Test con Milan
        console.log('🔍 Testing "Milan"...');
        const milanEnResult = await geocodingService.geocode('Milan', { limit: 5 });
        
        if (milanEnResult.success) {
            console.log(`✅ Found ${milanEnResult.results.length} results for Milan:`);
            milanEnResult.results.forEach((city, i) => {
                console.log(`   ${i+1}. ${city.name}, ${city.country} (${city.population.toLocaleString()}) - ${city.confidence.toFixed(2)}`);
            });
        } else {
            console.log('❌ No results for Milan');
        }
        
        // Statistiche
        console.log('\n📊 Database Stats:');
        const stats = geocodingService.getStats();
        console.log(`   Total cities: ${stats.totalCities}`);
        console.log(`   Italian cities: ${stats.italianCities}`);
        console.log(`   Index size: ${stats.indexSize}`);
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

quickTest();
