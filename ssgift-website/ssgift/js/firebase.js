/**
 * SS GIFT — Firebase / Google Auth Wrapper
 *
 * HOW TO ACTIVATE GOOGLE SIGN-IN:
 * ─────────────────────────────────────────
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (e.g. "ss-gift")
 * 3. Click "Add app" → Web → register app
 * 4. Copy the firebaseConfig values into js/config.js
 * 5. In Firebase console → Authentication → Sign-in method
 *    → Enable "Google"
 * 6. Add your domain to Authorized Domains list
 * ─────────────────────────────────────────
 * Until configured, Google button shows but falls back gracefully.
 */

const FirebaseAuth = (() => {
  let _auth     = null;
  let _provider = null;
  let _ready    = false;

  const init = () => {
    try {
      // Check if Firebase SDK loaded and config is real
      if (
        typeof firebase === 'undefined' ||
        CONFIG.FIREBASE.apiKey === 'YOUR_API_KEY'
      ) {
        console.info('[SS GIFT] Firebase not configured — Google Sign-In disabled. See js/firebase.js for setup instructions.');
        return;
      }

      // Initialize Firebase app (avoid duplicate init)
      if (!firebase.apps.length) {
        firebase.initializeApp(CONFIG.FIREBASE);
      }

      _auth     = firebase.auth();
      _provider = new firebase.auth.GoogleAuthProvider();
      _provider.addScope('profile');
      _provider.addScope('email');
      _ready = true;

      // Listen for auth state changes (handles page reload persistence)
      _auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          const current = Store.getCurrentUser();
          // Only auto-apply if no session exists yet (avoid overwriting admin)
          if (!current) {
            _syncFirebaseUser(firebaseUser);
          }
        }
      });

    } catch (e) {
      console.warn('[SS GIFT] Firebase init error:', e.message);
    }
  };

  // Sync a Firebase user object → our local user store + session
  const _syncFirebaseUser = (firebaseUser) => {
    const uid   = firebaseUser.uid;
    const name  = firebaseUser.displayName || 'User';
    const email = firebaseUser.email || '';
    const photo = firebaseUser.photoURL || '';

    let users = Store.getUsers();
    let user  = users.find(u => u.id === uid || u.email === email);

    if (!user) {
      // First time Google sign-in — create account
      user = {
        id:        uid,
        name,
        email,
        photo,
        phone:     '',
        password:  null,        // Google users have no password
        provider:  'google',
        blocked:   false,
        createdAt: new Date().toLocaleDateString('en-IN'),
      };
      users.push(user);
      Store.setUsers(users);
    } else {
      // Update name/photo in case they changed on Google
      user.photo = photo;
      user.name  = name;
      Store.setUsers(users);
    }

    Store.setCurrentUser({ ...user, isAdmin: false });
    UI.renderAuthArea();
  };

  // Sign in with Google popup
  const signInWithGoogle = async () => {
    if (!_ready) {
      Toast.show('Google Sign-In not configured yet. Please use email login.', 'warning', 4000);
      return;
    }

    try {
      const result = await _auth.signInWithPopup(_provider);
      _syncFirebaseUser(result.user);
      Toast.show(`Welcome, ${result.user.displayName?.split(' ')[0]}! 🎉`, 'success');
      Router.go('account');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return; // silent
      if (err.code === 'auth/cancelled-popup-request') return;
      Toast.show('Google sign-in failed. Try again.', 'error');
      console.warn('[SS GIFT] Google sign-in error:', err.message);
    }
  };

  // Sign out from Firebase too (if active)
  const signOut = async () => {
    if (_ready && _auth) {
      try { await _auth.signOut(); } catch (_) {}
    }
  };

  const isReady = () => _ready;

  return { init, signInWithGoogle, signOut, isReady };
})();