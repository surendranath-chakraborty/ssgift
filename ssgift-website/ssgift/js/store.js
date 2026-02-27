/**
 * SS GIFT — Store (localStorage + Firestore Sync)
 * - localStorage for instant access
 * - Firestore for cross-device sync (users, orders, session)
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

  // ── Firestore helpers ────────────────────────────────────────
  const _db = () => {
    try { return (typeof firebase !== 'undefined' && firebase.apps.length) ? firebase.firestore() : null; }
    catch { return null; }
  };

  // Save user to Firestore
  const syncUserToCloud = async (user) => {
    const db = _db();
    if (!db || !user?.id) return;
    try {
      await db.collection('users').doc(user.id).set(user, { merge: true });
    } catch (e) {
      console.warn('[Store] Firestore user sync failed:', e.message);
    }
  };

  // Load user from Firestore by email
  const loadUserFromCloud = async (email) => {
    const db = _db();
    if (!db || !email) return null;
    try {
      const snap = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!snap.empty) return snap.docs[0].data();
    } catch (e) {
      console.warn('[Store] Firestore user load failed:', e.message);
    }
    return null;
  };

  // Save order to Firestore
  const syncOrderToCloud = async (order) => {
    const db = _db();
    if (!db || !order?.id) return;
    try {
      await db.collection('orders').doc(order.id).set(order, { merge: true });
    } catch (e) {
      console.warn('[Store] Firestore order sync failed:', e.message);
    }
  };

  // Save session to Firestore (for cross-device login persistence)
  const syncSessionToCloud = async (user) => {
    const db = _db();
    if (!db || !user?.id) return;
    try {
      await db.collection('sessions').doc(user.id).set({
        userId: user.id,
        email:  user.email,
        name:   user.name,
        photo:  user.photo || '',
        isAdmin: user.isAdmin || false,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('[Store] Firestore session sync failed:', e.message);
    }
  };

  // Clear session from Firestore
  const clearSessionFromCloud = async (userId) => {
    const db = _db();
    if (!db || !userId) return;
    try {
      await db.collection('sessions').doc(userId).delete();
    } catch (e) {
      console.warn('[Store] Firestore session clear failed:', e.message);
    }
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
    setCurrentUser: (v) => {
      _set(K.CURRENT, v);
      // Sync session to Firestore for cross-device persistence
      if (v) syncSessionToCloud(v);
    },
    clearSession: () => {
      const user = _get(K.CURRENT, null);
      if (user?.id) clearSessionFromCloud(user.id);
      localStorage.removeItem(K.CURRENT);
    },

    // ---- Subscribers ----
    getSubscribers: ()  => _get(K.SUBS, []),
    setSubscribers: (v) => _set(K.SUBS, v),

    // ---- Helpers ----
    getProductById: (id) => Store.getProducts().find(p => p.id === id),

    // ---- Cloud helpers (used by Auth) ----
    syncUserToCloud,
    loadUserFromCloud,
    syncOrderToCloud,
  };
})();