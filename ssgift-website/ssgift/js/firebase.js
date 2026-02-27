/**
 * SS GIFT — Firebase / Google Auth Wrapper
 * Uses redirect instead of popup to avoid COOP browser errors
 */

const FirebaseAuth = (() => {
  let _auth     = null;
  let _provider = null;
  let _ready    = false;

  const init = () => {
    try {
      if (
        typeof firebase === 'undefined' ||
        CONFIG.FIREBASE.apiKey === 'YOUR_API_KEY'
      ) {
        console.info('[SS GIFT] Firebase not configured — Google Sign-In disabled.');
        return;
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(CONFIG.FIREBASE);
      }

      _auth     = firebase.auth();
      _provider = new firebase.auth.GoogleAuthProvider();
      _provider.addScope('profile');
      _provider.addScope('email');
      _ready = true;

      console.info('[SS GIFT] Firebase initialized ✓');

      // Handle redirect result when user comes back after Google login
      _auth.getRedirectResult().then((result) => {
        if (result && result.user) {
          _syncFirebaseUser(result.user);
          Toast.show(`Welcome, ${result.user.displayName?.split(' ')[0]}! 🎉`, 'success');
          Router.go('account');
        }
      }).catch((err) => {
        if (err.code && err.code !== 'auth/no-current-user') {
          console.warn('[SS GIFT] Redirect result error:', err.message);
        }
      });

      // Listen for auth state changes (handles page reload persistence)
      _auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          const current = Store.getCurrentUser();
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
      user = {
        id:        uid,
        name,
        email,
        photo,
        phone:     '',
        password:  null,
        provider:  'google',
        blocked:   false,
        createdAt: new Date().toLocaleDateString('en-IN'),
      };
      users.push(user);
      Store.setUsers(users);
    } else {
      user.photo = photo;
      user.name  = name;
      Store.setUsers(users);
    }

    Store.setCurrentUser({ ...user, isAdmin: false });
    UI.renderAuthArea();
  };

  // Sign in with Google — uses REDIRECT (no popup, avoids COOP errors)
  const signInWithGoogle = async () => {
    if (!_ready) {
      Toast.show('Google Sign-In not configured yet. Please use email login.', 'warning', 4000);
      return;
    }

    try {
      await _auth.signInWithRedirect(_provider);
    } catch (err) {
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