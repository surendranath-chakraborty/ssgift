/**
 * SS GIFT — Store (localStorage Abstraction)
 * All data read/write goes through this module.
 */
const Store = (() => {
  const K = CONFIG.STORAGE_KEYS;

  const _get = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const _set = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.error('Store write failed:', e); }
  };

  return {
    // ---- Products ----
    getProducts:    ()  => _get(K.PRODUCTS, SEED_PRODUCTS),
    setProducts:    (v) => _set(K.PRODUCTS, v),

    // ---- Cart ----
    getCart:        ()  => _get(K.CART, []),
    setCart:        (v) => { _set(K.CART, v); UI.updateBadges(); },

    // ---- Wishlist ----
    getWishlist:    ()  => _get(K.WISHLIST, []),
    setWishlist:    (v) => { _set(K.WISHLIST, v); UI.updateBadges(); },

    // ---- Users ----
    getUsers:       ()  => _get(K.USERS, []),
    setUsers:       (v) => _set(K.USERS, v),

    // ---- Orders ----
    getOrders:      ()  => _get(K.ORDERS, []),
    setOrders:      (v) => _set(K.ORDERS, v),

    // ---- Coupons ----
    getCoupons:     ()  => _get(K.COUPONS, SEED_COUPONS),
    setCoupons:     (v) => _set(K.COUPONS, v),

    // ---- Current User (session) ----
    getCurrentUser: ()  => _get(K.CURRENT, null),
    setCurrentUser: (v) => _set(K.CURRENT, v),
    clearSession:   ()  => localStorage.removeItem(K.CURRENT),

    // ---- Subscribers ----
    getSubscribers: ()  => _get(K.SUBS, []),
    setSubscribers: (v) => _set(K.SUBS, v),

    // ---- Helpers ----
    getProductById: (id) => Store.getProducts().find(p => p.id === id),
  };
})();