/**
 * Test completo di tutti gli endpoint dell'API
 */
const http = require('http');

const API_BASE = 'localhost:3000';
const API_KEY = 'test-api-key-123456789';

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const response = data ? JSON.parse(responseData) : responseData;
          resolve({
            status: res.statusCode,
            data: response
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const testEndpoints = async () => {
  console.log('🧪 Testing ALL API Endpoints\n');
  
  const tests = [
    {
      name: 'Health Check',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/health',
        method: 'GET'
      }
    },
    {
      name: 'API Info',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/info',
        method: 'GET'
      }
    },
    {
      name: 'Natal Chart',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/natal-chart',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        birth_date: "1990-05-15",
        birth_time: "14:30:00",
        latitude: 45.4642,
        longitude: 9.1900
      }
    },
    {
      name: 'Planets Only',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/planets',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        birth_date: "1990-05-15",
        birth_time: "14:30:00",
        latitude: 45.4642,
        longitude: 9.1900
      }
    },
    {
      name: 'Houses Only',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/houses',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        birth_date: "1990-05-15",
        birth_time: "14:30:00",
        latitude: 45.4642,
        longitude: 9.1900
      }
    },
    {
      name: 'Ascendant Only',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/ascendant',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        birth_date: "1990-05-15",
        birth_time: "14:30:00",
        latitude: 45.4642,
        longitude: 9.1900
      }
    },
    {
      name: 'Daily Horoscope',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/daily-horoscope',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        sign: "leo"
      }
    },
    {
      name: 'Weekly Horoscope',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/weekly-horoscope',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        sign: "gemini"
      }
    },
    {
      name: 'Monthly Horoscope',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/monthly-horoscope',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        sign: "virgo"
      }
    },
    {
      name: 'Personal Forecast',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/personal-forecast',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        birth_date: "1990-05-15",
        birth_time: "14:30:00",
        latitude: 45.4642,
        longitude: 9.1900
      }
    },
    {
      name: 'Geocoding',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/geocoding',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        query: "Milano"
      }
    },
    {
      name: 'Reverse Geocoding',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/reverse-geocoding',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        latitude: 45.4642,
        longitude: 9.1900
      }
    },
    {
      name: 'Geocoding Stats',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/geocoding/stats',
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY
        }
      }
    },
    {
      name: 'Natal Chart with Geocoding',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/natal-chart-geocoded',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      },
      data: {
        birth_date: "1990-05-15",
        birth_time: "14:30:00",
        birth_place: "Milano"
      }
    },
    {
      name: 'Geocoding Autocomplete',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/v1/geocoding/autocomplete?q=Roma',
        method: 'GET'
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing ${test.name}...`);
      const result = await makeRequest(test.options, test.data);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`✅ ${test.name} - Status: ${result.status}`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - Status: ${result.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All endpoints are working correctly!');
  } else {
    console.log('\n⚠️ Some endpoints need attention.');
  }
};

testEndpoints().catch(console.error);