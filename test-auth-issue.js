// Test API authentication issue
const { default: fetch } = require('node-fetch');

async function testAuth() {
  try {
    console.log('🧪 Testing API authentication...\n');

    // Test 1: Check session endpoint
    console.log('1. Testing session endpoint...');
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${sessionResponse.status}`);
    const sessionData = await sessionResponse.text();
    console.log(`   Response: ${sessionData}\n`);

    // Test 2: Try product creation without auth (should fail with 401)
    console.log('2. Testing product creation without authentication...');
    const productData = {
      name: 'Test Product',
      description: 'A test product',
      price: 29.99,
      stock: 10,
      isActive: true,
      isFeatured: false
    };

    const createResponse = await fetch('http://localhost:3001/api/seller/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    console.log(`   Status: ${createResponse.status}`);
    const createData = await createResponse.text();
    console.log(`   Response: ${createData}\n`);

    // Test 3: Direct auth test
    console.log('3. Testing credentials authentication...');
    const authTestResponse = await fetch('http://localhost:3001/api/test-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'seller@example.com',
        password: 'seller123'
      }),
    });

    console.log(`   Status: ${authTestResponse.status}`);
    const authTestData = await authTestResponse.text();
    console.log(`   Response: ${authTestData}`);

  } catch (error) {
    console.error('❌ Error testing authentication:', error);
  }
}

testAuth();
