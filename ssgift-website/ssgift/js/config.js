/**
 * SS GIFT — App Configuration
 * Central config file. Change settings here.
 */
const CONFIG = Object.freeze({
  APP_NAME:       'SS GIFT',
  TAGLINE:        'Where Love Finds Its Form',
  WHATSAPP_NUM:   '918967882790',
  ADMIN_EMAIL:    'admin@ssgift.com',
  ADMIN_PASS:     'ssgift@2024',
  FREE_DELIVERY_ABOVE: 499,
  DELIVERY_CHARGE:     49,
  PRODUCTS_PER_PAGE:   12,
  STORAGE_KEYS: {
    PRODUCTS:  'ssgift_products',
    CART:      'ssgift_cart',
    WISHLIST:  'ssgift_wishlist',
    USERS:     'ssgift_users',
    ORDERS:    'ssgift_orders',
    COUPONS:   'ssgift_coupons',
    CURRENT:   'ssgift_current',
    SUBS:      'ssgift_subs',
  }
});
