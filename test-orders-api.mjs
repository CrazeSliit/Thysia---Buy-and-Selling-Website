import fetch from 'node-fetch'

// Test the orders API endpoint
async function testOrdersAPI() {
  try {
    // First, test with a simple GET to see if the endpoint is working
    console.log('Testing GET /api/orders...')
    
    const getResponse = await fetch('http://localhost:3001/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('GET status:', getResponse.status)
    const getData = await getResponse.text()
    console.log('GET response:', getData)
    
    // Now test POST
    console.log('\nTesting POST /api/orders...')
    
    const postResponse = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartItems: [{
          productId: 'cmcbmbgas000zemlb31qb8cc8',
          quantity: 1,
          price: 299.99
        }],
        shippingAddressId: 'cmcbkof2b000qa1hrx8hocxe5',
        billingAddressId: 'cmcbkof2b000qa1hrx8hocxe5',
        paymentMethod: 'CREDIT_CARD'
      })
    })
    
    console.log('POST status:', postResponse.status)
    const postData = await postResponse.text()
    console.log('POST response:', postData)
    
  } catch (error) {
    console.error('Error testing API:', error)
  }
}

testOrdersAPI()
