const event_prefix = '';
const formattedItemId = true;
const GTM_container_url = 'https://www.googletagmanager.com';
const GTM_container_id = 'GTM-0000000';

let storeCountryCode = window.localStorage.getItem('shopCountryCode');
storeCountryCode = storeCountryCode || 'US';
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}

if (window.location.href.includes('/checkouts/cn/')) {
    // tag manager
    (function(w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = GTM_container_url + '/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_container_id);

    analytics.subscribe('page_viewed', (event) => {
        window.dataLayer.push({
          event: 'page_view',
          page_location: event.context.document.location.href,
        });
    });
    // end tag manager

    // DataLayer Events
    analytics.subscribe('checkout_started', (event) => ecommerceDataLayer('begin_checkout', event));

    analytics.subscribe('payment_info_submitted', (event) => ecommerceDataLayer('add_payment_info', event));

    analytics.subscribe('checkout_shipping_info_submitted', (event) => ecommerceDataLayer('add_shipping_info', event));

    analytics.subscribe('checkout_completed', (event) => ecommerceDataLayer('purchase', event));

}

// Country calling codes (ISO 3166-1 alpha-2 -> E.164 prefix)
const dialCodes = 'AD376 AE971 AF93 AG1 AI1 AL355 AM374 AO244 AR54 AS1 AT43 AU61 AW297 AX358 AZ994 BA387 BB1 BD880 BE32 BF226 BG359 BH973 BI257 BJ229 BL590 BM1 BN673 BO591 BQ599 BR55 BS1 BT975 BW267 BY375 BZ501 CA1 CC61 CD243 CF236 CG242 CH41 CI225 CK682 CL56 CM237 CN86 CO57 CR506 CU53 CV238 CW599 CX61 CY357 CZ420 DE49 DJ253 DK45 DM1 DO1 DZ213 EC593 EE372 EG20 EH212 ER291 ES34 ET251 FI358 FJ679 FK500 FM691 FO298 FR33 GA241 GB44 GD1 GE995 GF594 GG44 GH233 GI350 GL299 GM220 GN224 GP590 GQ240 GR30 GT502 GU1 GW245 GY592 HK852 HN504 HR385 HT509 HU36 ID62 IE353 IL972 IM44 IN91 IO246 IQ964 IR98 IS354 IT39 JE44 JM1 JO962 JP81 KE254 KG996 KH855 KI686 KM269 KN1 KP850 KR82 KW965 KY1 KZ7 LA856 LB961 LC1 LI423 LK94 LR231 LS266 LT370 LU352 LV371 LY218 MA212 MC377 MD373 ME382 MF590 MG261 MH692 MK389 ML223 MM95 MN976 MO853 MP1 MQ596 MR222 MS1 MT356 MU230 MV960 MW265 MX52 MY60 MZ258 NA264 NC687 NE227 NF672 NG234 NI505 NL31 NO47 NP977 NR674 NU683 NZ64 OM968 PA507 PE51 PF689 PG675 PH63 PK92 PL48 PM508 PR1 PS970 PT351 PW680 PY595 QA974 RE262 RO40 RS381 RU7 RW250 SA966 SB677 SC248 SD249 SE46 SG65 SH290 SI386 SJ47 SK421 SL232 SM378 SN221 SO252 SR597 SS211 ST239 SV503 SX1 SY963 SZ268 TC1 TD235 TG228 TH66 TJ992 TK690 TL670 TM993 TN216 TO676 TR90 TT1 TV688 TW886 TZ255 UA380 UG256 US1 UY598 UZ998 VA39 VC1 VE58 VG1 VI1 VN84 VU678 WF681 WS685 XK383 YE967 YT262 ZA27 ZM260 ZW263'
    .split(' ').reduce((map, entry) => { map[entry.slice(0, 2)] = entry.slice(2); return map; }, {});

// Formats a phone number to E.164 (+31612345678). Falls back to the raw digits when no country is known.
function formatPhoneE164(rawPhone, countryCode) {
    if (!rawPhone) return undefined;
    let phone = String(rawPhone).replace(/[^\d+]/g, '');
    if (!phone) return undefined;
    if (phone.startsWith('00')) phone = '+' + phone.slice(2);
    if (phone.startsWith('+')) return '+' + phone.slice(1).replace(/\D/g, '');
    const prefix = dialCodes[String(countryCode || '').toUpperCase()];
    if (!prefix) return phone;
    if (phone.startsWith('0') && countryCode !== 'IT') phone = phone.slice(1);
    return '+' + prefix + phone;
}

function ecommerceDataLayer(gtm_event_name, event) {
    const checkout = event.data?.checkout;
    const billing = checkout?.billingAddress;
    const shipping = checkout?.shippingAddress;
    const email = checkout?.email;
    // checkout.phone is only filled when the contact step asks for a phone number.
    // Otherwise the number the buyer types lives on the address object.
    const phone = formatPhoneE164(
        checkout?.phone || shipping?.phone || billing?.phone,
        shipping?.countryCode || billing?.countryCode || storeCountryCode
    );

    const customerInfo = {
        customer: {
            first_name: billing?.firstName || shipping?.firstName,
            last_name: billing?.lastName || shipping?.lastName,
            email: email,
            phone: phone,
            address: billing || shipping
        }
    }
    dataLayer.push(customerInfo);

    const dataLayerInfo = {
        event: event_prefix + gtm_event_name,
        page_location: event.context.document.location.href,
        ecommerce: {
            transaction_id: checkout?.order?.id,
            value: checkout?.totalPrice?.amount,
            tax: checkout?.totalTax?.amount,
            shipping: checkout?.shippingLine?.price?.amount,
            currency: checkout?.currencyCode,
            coupon: (checkout?.discountApplications || []).map(discount => discount.title).join(','),
            items: (checkout?.lineItems || []).map(item => ({
                item_id: formattedItemId ? 'shopify_' + storeCountryCode + '_' + (item.variant?.product?.id || '') + '_' + (item.variant?.id || '') : item.variant?.product?.id,
                id: formattedItemId ? 'shopify_' + storeCountryCode + '_' + (item.variant?.product?.id || '') + '_' + (item.variant?.id || '') : item.variant?.product?.id,
                product_id: item.variant?.product?.id?.toString(),
                variant_id: item.variant?.id?.toString(),
                sku: item.variant?.sku,
                item_name: item.title,
                coupon: item.discountAllocations?.discountApplication?.title,
                discount: item.discountAllocations?.amount?.amount,
                item_variant: item.variant?.title === 'Default Title' ? undefined : item.variant?.title,
                price: item.variant?.price?.amount,
                quantity: item.quantity,
                item_brand: item.variant?.product?.vendor,
                item_category: item.variant?.product?.type

            }))
        }
    }

    dataLayer.push({
        ecommerce: null
    });
    dataLayer.push(dataLayerInfo);

    console.log('Event: ' + event_prefix + gtm_event_name, Object.assign(dataLayerInfo, customerInfo));
}
