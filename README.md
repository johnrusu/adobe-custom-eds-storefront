# Adobe Commerce Storefront with Stripe Payment

A modern headless storefront for Adobe Commerce 2.4.8 with integrated Stripe payment processing.

## Demo

![Demo](assets/preview.gif)

## Features

- 🛍️ Product catalog from Adobe Commerce GraphQL API
- 🛒 Client-side cart management with Bootstrap modal
- 💳 Stripe Payment Element integration
- 📱 Responsive design with Bootstrap 5
- 🔒 Secure configuration management via GitHub Actions
- 🚀 Automated deployment to GitHub Pages

## Setup

1. Clone the repository
2. Copy `config.example.js` to `config.js` and add your keys:
   ```javascript
   window.STOREFRONT_CONFIG = {
     GRAPHQL_ENDPOINT: "http://localhost/graphql",
     STRIPE_PUBLISHABLE_KEY: "pk_test_..."
   };
   ```
3. Open `index.html` in your browser

## Deployment

Push to GitHub to trigger automatic deployment. Configure these secrets in repository settings:
- `STRIPE_PUBLISHABLE_KEY`
- `GRAPHQL_ENDPOINT`
