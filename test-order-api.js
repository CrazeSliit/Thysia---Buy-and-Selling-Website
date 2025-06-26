const fetch = require('node-fetch');

async function testOrderAPI() {
  try {
    // First, let me create a simple test order
    const checkoutData = {
      cartItems: [
        {
          productId: "cmcbkof1w000ia1hr2pd2mkla", // iPhone 15 Pro
          quantity: 1,
          price: 999.99
        }
      ],
      shippingAddressId: "cmcbkof2b000qa1hrx8hocxe5",
      billingAddressId: "cmcbkof2b000qa1hrx8hocxe5",
      paymentMethod: "CREDIT_CARD"
    };

    console.log('Making request to order API...');
    
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, we'd need to include proper session cookies
      },
      body: JSON.stringify(checkoutData)
    });

    console.log('Response status:', response.status);
    
    const responseData = await response.text();
    console.log('Response data:', responseData);

  } catch (error) {
    console.error('Error:', error);
  }
}

testOrderAPI();
