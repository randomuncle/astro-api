/**
 * Test script per verificare che il server funzioni correttamente
 */
const http = require('http');

async function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/v1/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: response
          });
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testNatalChart() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      birth_date: "1990-05-15",
      birth_time: "14:30:00",
      latitude: 45.4642,
      longitude: 9.1900
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/v1/natal-chart',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-api-key-123456789',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: response
          });
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function testDailyHoroscope() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      sign: "leo"
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/v1/daily-horoscope',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-api-key-123456789',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: response
          });
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API tests...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing health endpoint...');
    const healthResult = await testHealthEndpoint();
    console.log('✅ Health check passed');
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Service: ${healthResult.data.service}`);
    console.log(`   Swiss Ephemeris: ${healthResult.data.swiss_ephemeris_available ? 'Available' : 'Mock mode'}`);
    console.log('');
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('');
    return;
  }

  // Test 2: Natal Chart
  try {
    console.log('2️⃣ Testing natal chart endpoint...');
    const natalResult = await testNatalChart();
    console.log('✅ Natal chart calculation passed');
    console.log(`   Status: ${natalResult.status}`);
    console.log(`   Planets calculated: ${Object.keys(natalResult.data.planets || {}).length}`);
    console.log(`   Houses calculated: ${Object.keys(natalResult.data.houses || {}).filter(k => k !== 'ascendant' && k !== 'mc').length}`);
    console.log(`   Aspects found: ${(natalResult.data.aspects || []).length}`);
    console.log('');
  } catch (error) {
    console.log('❌ Natal chart test failed:', error.message);
    console.log('');
  }

  // Test 3: Daily Horoscope
  try {
    console.log('3️⃣ Testing daily horoscope endpoint...');
    const horoscopeResult = await testDailyHoroscope();
    console.log('✅ Daily horoscope passed');
    console.log(`   Status: ${horoscopeResult.status}`);
    console.log(`   Sign: ${horoscopeResult.data.sign || 'N/A'}`);
    console.log(`   Overall rating: ${horoscopeResult.data.interpretation?.rating?.overall || 'N/A'}/5`);
    console.log('');
  } catch (error) {
    console.log('❌ Daily horoscope test failed:', error.message);
    console.log('');
  }

  console.log('🎉 Test suite completed!');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testHealthEndpoint, testNatalChart, testDailyHoroscope };
