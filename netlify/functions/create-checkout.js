const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing STRIPE_SECRET_KEY. Add it in Netlify env variables.'
      })
    };
  }

  try {
    const { items = [] } = JSON.parse(event.body || '{}');

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : []
        },
        unit_amount: Math.round(Number(item.price || 0) * 100)
      },
      quantity: Number(item.qty || 1)
    }));

    const baseUrl = process.env.URL || 'http://localhost:8888';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop.html`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'IN', 'AU', 'DE', 'FR', 'ES']
      },
      billing_address_collection: 'auto'
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Unable to create Stripe Checkout session.'
      })
    };
  }
};
