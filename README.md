# Shopify Custom Pixel for GTM

Use this custom pixel to load your GTM web container inside Shopify checkout and push a GA4 ecommerce dataLayer for `begin_checkout`, `add_shipping_info`, `add_payment_info` and `purchase`. Customer data (name, email, phone, address) is pushed alongside each event as plain values for Advanced Matching and Enhanced Conversions. The phone number is formatted to E.164 (`+31612345678`). Hashing is left to the tags that send the data, so every platform normalises the values its own way.

Works with server-side tagging (Stape, TAGGRS, or a GTM Web Client custom loader) and Consent Mode v2.

## Installation

1. Go to your Shopify store.
2. Go to **Settings**.
3. Click on **Customer events**.
4. Click on **Custom pixels**.
5. Click on **Add custom pixel** and give it a name.
6. Copy and paste the code from [`custom-pixel.js`](custom-pixel.js).
7. Change `GTM_container_url` to your server URL when using server-side GTM's GTM Web Client or a Stape / TAGGRS custom loader. Leave it as is when loading GTM directly from Google.
8. Change `GTM_container_id` to your **web** container ID (not the server container ID).
9. Click on **Save**.
10. Click on **Connect**.

## Settings

| Constant | Default | Description |
|---|---|---|
| `event_prefix` | `''` | Optional prefix for every event name, e.g. `shopify_` to get `shopify_purchase`. |
| `formattedItemId` | `true` | Format `item_id` as `shopify_{COUNTRY}_{product_id}_{variant_id}` to match the Google Merchant Center feed. Set to `false` to use the plain product ID. |
| `GTM_container_url` | `https://www.googletagmanager.com` | Where `gtm.js` is loaded from. |
| `GTM_container_id` | `GTM-0000000` | Your GTM web container ID. |

The country code used in `item_id` is read from `localStorage.shopCountryCode` and falls back to `US`. Set that key in your theme if your store sells in multiple markets.

The phone number comes from the checkout contact field, then the shipping address, then the billing address. A number without a country prefix gets the prefix of the shipping country, then the billing country, then the store country code above. Name and address fall back to the shipping address when there is no billing address.

## Events pushed to the dataLayer

| Shopify event | dataLayer event |
|---|---|
| `page_viewed` | `page_view` |
| `checkout_started` | `begin_checkout` |
| `checkout_shipping_info_submitted` | `add_shipping_info` |
| `payment_info_submitted` | `add_payment_info` |
| `checkout_completed` | `purchase` |

Every ecommerce event carries `transaction_id`, `value`, `tax`, `shipping`, `currency`, `coupon` and an `items` array following the GA4 ecommerce schema. A `customer` object with the buyer's details is pushed right before it.

The pixel only initialises on `/checkouts/cn/` pages, so the rest of the storefront keeps using your theme's GTM snippet.

## Companion templates

- [User ID tag template](https://github.com/lucnugteren/gtm_web_tag_template_user_id) for external ID matching in Meta.
- [Restore GCLID tag template](https://github.com/lucnugteren/gtm_web_tag_template_restore_gclid) for Safari-stripped click IDs.
- [Purchase Count tag template](https://github.com/lucnugteren/gtm_web_tag_template_purchase_count) for new vs. returning customers in Google Ads.

More at [lucnugteren.com/resources](https://lucnugteren.com/resources).
