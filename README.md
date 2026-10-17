# Velora

Velora is a premium hoodie storefront designed for international customers. It includes:

- responsive storefront layout
- product catalog and featured products
- cart and checkout flow
- WhatsApp ordering support
- contact form placeholder for Formspree
- serverless Stripe checkout via Netlify Functions

## Files
- `index.html` — home page
- `shop.html` — product catalog
- `about.html` — about page
- `contact.html` — contact page
- `products.json` — product inventory
- `styles.css` — styling
- `app.js` — store logic
- `netlify/functions/create-checkout.js` — Stripe Checkout session creation
- `success.html` — order success page

## Required environment variables for Netlify
Add these in Netlify dashboard → Site configuration → Environment variables:
- `STRIPE_SECRET_KEY` — your live or test secret key from Stripe
- `URL` — your deployment URL, e.g. `https://your-site.netlify.app`

## Step-by-step Netlify deploy
1. Push this repo to GitHub.
2. In Netlify, choose Add new site → Import an existing project.
3. Select this GitHub repository.
4. Keep the default build settings for static sites.
5. Add the environment variables above.
6. Deploy the site.
7. Open the generated Netlify URL to test checkout.

## Stripe setup
1. Create a Stripe account.
2. Create a product or use the checkout API,
3. Create a secret key in Stripe dashboard.
4. Add it to Netlify as `STRIPE_SECRET_KEY`.
5. Redeploy the site.

## WhatsApp ordering
This store opens WhatsApp at:
- +91 82852029

## Contact form
The contact form in `contact.html` still uses a Formspree placeholder unless you replace `YOUR_FORM_ID` with your actual endpoint.

## Repository
https://github.com/manupatihariprasad63-dotcom/dropshipping-store
