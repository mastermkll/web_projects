# bikershood-web

Modern, conversion-focused multi-page e-commerce website for a motorcycle accessories brand.

## Included Pages

- `index.html` - Homepage with hero banner: **Upgrade Your Ride**
- `products.html` - Product listing with filters (bike model, brand, price, top/new)
- `product-detail.html` - Product detail with gallery, compatibility, cart + WhatsApp
- `byo.html` - Build Your Own Bike tool (4-step flow + live preview)
- `community.html` - Ride gallery, events, WhatsApp group CTA, Instagram feed
- `about.html` - Brand story and mission
- `contact.html` - Contact form with WhatsApp integration
- `cart.html` - Cart system with coupon and checkout actions

## Features Implemented

- Mobile-first UI
- Sticky navigation
- Global search bar
- Cart system using `localStorage`
- Compatibility labels (`Compatible with: Himalayan 411, KTM 390...`)
- Top Selling and New Arrivals merchandising
- Instagram feed sections
- Razorpay and Stripe-ready checkout hooks

## Razorpay / Stripe Setup

Edit `js/payment-config.js`:

```js
window.BIKERSHOOD_PAYMENT = {
  razorpayKey: "rzp_test_your_key",
  stripePaymentLink: ""
};
```

- Replace `razorpayKey` with your Razorpay test/live key.
- Add a Stripe payment link in `stripePaymentLink` for one-click checkout.

## Run Locally

Open `index.html` in a browser, or run any static server from this folder.
