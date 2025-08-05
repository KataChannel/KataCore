// Simple Facebook API test
const http = require('http');

const testFacebookAPI = async () => {
  console.log('🔬 Testing Facebook API endpoint directly...\n');

  const postData = JSON.stringify({
    token: 'test_token_validation'
  });

  const options = {
    hostname: 'localhost',
    port: 3900,
    path: '/api/auth/facebook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response:', data);
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

// Also test the health endpoint
const testHealthEndpoint = async () => {
  console.log('🏥 Testing Facebook health endpoint...\n');

  const options = {
    hostname: 'localhost',
    port: 3900,
    path: '/api/auth/facebook/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Health Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('Health Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Health Raw Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Health check failed: ${e.message}`);
  });

  req.end();
};

// Run tests
testHealthEndpoint();
setTimeout(() => testFacebookAPI(), 1000);
