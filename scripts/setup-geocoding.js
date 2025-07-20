/**
 * 🌍 SETUP GEOCODING DATABASE - GeoNames Integration
 * Scarica e prepara il database delle città per geocoding locale
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createGunzip } = require('zlib');
const readline = require('readline');

console.log('🌍 Setting up GeoNames Geocoding Database...\n');

// Helper function to determine place type
const getPlaceType = (featureClass, featureCode, population) => {
  if (featureClass === 'P') { // Populated places
    if (featureCode === 'PPLC') return 'capital';
    if (featureCode === 'PPLA') return 'major_city';
    if (population > 1000000) return 'major_city';
    if (population > 100000) return 'city';
    if (population > 10000) return 'town';
    return 'village';
  }
  if (featureClass === 'A') return 'administrative';
  if (featureClass === 'H') return 'water';
  if (featureClass === 'L') return 'area';
  if (featureClass === 'R') return 'road';
  if (featureClass === 'S') return 'spot';
  if (featureClass === 'T') return 'mountain';
  if (featureClass === 'U') return 'undersea';
  if (featureClass === 'V') return 'forest';
  return 'other';
};

// Crea directory per il database
const dbDir = path.join(__dirname, '..', 'geocoding');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Created geocoding directory');
}

// Download GeoNames database (cities with population > 1000)
const downloadGeoNames = () => {
  return new Promise((resolve, reject) => {
    const url = 'http://download.geonames.org/export/dump/cities1000.zip';
    const zipPath = path.join(dbDir, 'cities1000.zip');
    const txtPath = path.join(dbDir, 'cities1000.txt');
    
    console.log('📥 Downloading GeoNames database...');
    console.log('   (This may take a few minutes - ~25MB)');
    
    const file = fs.createWriteStream(zipPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      let downloadedBytes = 0;
      const totalBytes = parseInt(response.headers['content-length'] || '0');
      
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const progress = totalBytes ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
        process.stdout.write(`\r   Progress: ${progress}% (${Math.round(downloadedBytes / 1024 / 1024)}MB)`);
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n✅ Download completed');
        
        // Extract ZIP (manual for now - we'll use the .txt directly)
        console.log('⚠️  Please manually extract cities1000.txt from the ZIP file');
        console.log(`   ZIP location: ${zipPath}`);
        console.log(`   Extract to: ${txtPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(zipPath, () => {}); // Delete incomplete file
      reject(err);
    });
  });
};

// Alternative: download directly the .txt file (uncompressed, larger)
const downloadGeoNamesTxt = () => {
  return new Promise((resolve, reject) => {
    const url = 'https://download.geonames.org/export/dump/cities1000.txt';
    const txtPath = path.join(dbDir, 'cities1000.txt');
    
    console.log('📥 Downloading GeoNames database (uncompressed)...');
    console.log('   (This may take longer - ~150MB)');
    
    const file = fs.createWriteStream(txtPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      let downloadedBytes = 0;
      const totalBytes = parseInt(response.headers['content-length'] || '0');
      
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const progress = totalBytes ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
        process.stdout.write(`\r   Progress: ${progress}% (${Math.round(downloadedBytes / 1024 / 1024)}MB)`);
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n✅ Download completed');
        resolve(txtPath);
      });
    }).on('error', (err) => {
      fs.unlink(txtPath, () => {}); // Delete incomplete file
      reject(err);
    });
  });
};

// Process GeoNames data into optimized JSON
const processGeoNames = async (txtPath) => {
  console.log('🔄 Processing GeoNames data...');
  
  const jsonPath = path.join(dbDir, 'cities.json');
  const indexPath = path.join(dbDir, 'cities-index.json');
  
  const cities = [];
  const index = {}; // For fast search by name
  
  const fileStream = fs.createReadStream(txtPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let lineCount = 0;
  
  for await (const line of rl) {
    lineCount++;
    
    if (lineCount % 10000 === 0) {
      process.stdout.write(`\r   Processed: ${lineCount} cities`);
    }
    
    const fields = line.split('\t');
    
    if (fields.length >= 15) {
      const city = {
        id: parseInt(fields[0]),
        name: fields[1],
        ascii_name: fields[2],
        alternate_names: fields[3] ? fields[3].split(',').filter(n => n.length > 0) : [],
        latitude: parseFloat(fields[4]),
        longitude: parseFloat(fields[5]),
        feature_class: fields[6] || '', // P=city, A=country, H=stream, etc
        feature_code: fields[7] || '',  // PPL=populated place, PPLC=capital
        country_code: fields[8],
        admin1_code: fields[10], // State/Province
        population: parseInt(fields[14]) || 0,
        timezone: fields[17] || '',
        type: getPlaceType(fields[6], fields[7], parseInt(fields[14]) || 0)
      };
      
      cities.push(city);
      
      // Create search index
      const searchKey = city.name.toLowerCase();
      if (!index[searchKey]) {
        index[searchKey] = [];
      }
      index[searchKey].push(cities.length - 1);
      
      // Index ASCII name if different
      if (city.ascii_name && city.ascii_name !== city.name) {
        const asciiKey = city.ascii_name.toLowerCase();
        if (!index[asciiKey]) {
          index[asciiKey] = [];
        }
        index[asciiKey].push(cities.length - 1);
      }
      
      // Index alternate names
      city.alternate_names.forEach(alt => {
        if (alt.length > 1) { // Changed from 2 to 1
          const altKey = alt.toLowerCase();
          if (!index[altKey]) {
            index[altKey] = [];
          }
          index[altKey].push(cities.length - 1);
        }
      });
    }
  }
  
  console.log(`\n✅ Processed ${cities.length} cities`);
  
  // Sort cities by population (largest first)
  cities.sort((a, b) => b.population - a.population);
  
  // Save to JSON files
  console.log('💾 Saving database files...');
  
  fs.writeFileSync(jsonPath, JSON.stringify(cities, null, 2));
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  
  console.log(`✅ Database saved:`);
  console.log(`   Cities: ${jsonPath}`);
  console.log(`   Index: ${indexPath}`);
  
  // Create optimized version for production
  const optimizedPath = path.join(dbDir, 'cities-optimized.json');
  const optimized = {
    cities: cities.map(c => ({
      id: c.id,
      name: c.name,
      country: c.country_code,
      lat: c.latitude,
      lon: c.longitude,
      pop: c.population,
      alternate_names: c.alternate_names || []
    })),
    index: index
  };
  
  fs.writeFileSync(optimizedPath, JSON.stringify(optimized));
  console.log(`✅ Optimized database: ${optimizedPath}`);
  
  return { cities: cities.length, jsonPath, indexPath, optimizedPath };
};

// Main setup function
const main = async () => {
  try {
    // Check which database files are available
    const dbFiles = [
      { name: 'allCountries.txt', priority: 1, description: 'Complete database (~12M places)' },
      { name: 'cities500.txt', priority: 2, description: 'Cities with pop > 500 (~400K)' },
      { name: 'cities1000.txt', priority: 3, description: 'Cities with pop > 1000 (~200K)' }
    ];
    
    let selectedFile = null;
    
    // Find the best available database file
    for (const dbFile of dbFiles) {
      const filePath = path.join(dbDir, dbFile.name);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 1000000) { // At least 1MB
          selectedFile = { ...dbFile, path: filePath, size: stats.size };
          console.log(`✅ Found database: ${dbFile.name} (${Math.round(stats.size / 1024 / 1024)}MB)`);
          console.log(`   ${dbFile.description}`);
          break;
        }
      }
    }
    
    if (!selectedFile) {
      console.log('❌ No valid database file found. Available options:');
      console.log('   - Copy cities1000.txt to ./geocoding/ directory');
      console.log('   - Copy cities500.txt to ./geocoding/ directory');
      console.log('   - Copy allCountries.txt to ./geocoding/ directory');
      console.log('');
      console.log('📥 Or run download (will download cities1000.txt):');
      
      await downloadGeoNamesTxt();
      selectedFile = {
        name: 'cities1000.txt',
        path: path.join(dbDir, 'cities1000.txt'),
        description: 'Downloaded cities1000'
      };
    }
    
    // Process the selected database
    const result = await processGeoNames(selectedFile.path);
    
    console.log('\n🎉 Geocoding database setup completed!');
    console.log(`📊 Statistics:`);
    console.log(`   Database used: ${selectedFile.name}`);
    console.log(`   Cities processed: ${result.cities.toLocaleString()}`);
    console.log(`   Database size: ~${Math.round(fs.statSync(result.optimizedPath).size / 1024 / 1024)}MB`);
    
    console.log('\n📋 Next steps:');
    console.log('1. Restart server: npm start');
    console.log('2. Test geocoding: POST /v1/geocoding');
    console.log('3. Check stats: GET /v1/geocoding/stats');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup
if (require.main === module) {
  main();
}

module.exports = { main, processGeoNames };