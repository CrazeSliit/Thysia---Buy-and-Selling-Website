// Test API endpoints directly
const { default: fetch } = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test authentication endpoint
    console.log('1. Testing authentication...');
    const authResponse = await fetch('http://localhost:3001/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`   - Auth endpoint status: ${authResponse.status}`);
    const authData = await authResponse.json();
    console.log(`   - Session data:`, authData);

    // Test product creation without authentication
    console.log('\n2. Testing product creation without auth...');
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

    console.log(`   - Product creation status: ${createResponse.status}`);
    const createData = await createResponse.json();
    console.log(`   - Response:`, createData);

  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testAPI();
