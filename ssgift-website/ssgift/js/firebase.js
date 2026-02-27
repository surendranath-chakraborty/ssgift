/**
 * SS GIFT — Firebase Auth Wrapper
 * Handles: Google Sign-In, Forgot Password (email reset)
 */
const FirebaseAuth = (() => {
  let _auth     = null;
  let _provider = null;
  let _ready    = false;

  const init = () => {
    try {
      if (typeof firebase === 'undefined' || CONFIG.FIREBASE.apiKey === 'YOUR_API_KEY') {
        console.info('[SS GIFT] Firebase not configured.');
        return;
      }
      if (!firebase.apps.length) firebase.initializeApp(CONFIG.FIREBASE);
      _auth     = firebase.auth();
      _provider = new firebase.auth.GoogleAuthProvider();
      _provider.addScope('profile');
      _provider.addScope('email');
      _ready = true;

      _auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser && !Store.getCurrentUser()) {
          _syncFirebaseUser(firebaseUser);
        }
      });
    } catch (e) {
      console.warn('[SS GIFT] Firebase init error:', e.message);
    }
  };

  const _syncFirebaseUser = (firebaseUser) => {
    const uid = firebaseUser.uid, name = firebaseUser.displayName || 'User',
          email = firebaseUser.email || '', photo = firebaseUser.photoURL || '';
    let users = Store.getUsers();
    let user  = users.find(u => u.id === uid || u.email === email);
    if (!user) {
      user = { id:uid, name, email, photo, phone:'', password:null,
               provider:'google', blocked:false, createdAt:new Date().toLocaleDateString('en-IN') };
      users.push(user); Store.setUsers(users);
    } else {
      user.photo = photo; user.name = name; Store.setUsers(users);
    }
    Store.setCurrentUser({ ...user, isAdmin: false });
    UI.renderAuthArea();
  };

  const signInWithGoogle = async () => {
    if (!_ready) { Toast.show('Google Sign-In not configured. Use email login.', 'warning'); return; }
    try {
      const result = await _auth.signInWithPopup(_provider);
      _syncFirebaseUser(result.user);
      Toast.show(`Welcome, ${result.user.displayName?.split(' ')[0]}! 🎉`, 'success');
      Router.go('account');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      Toast.show('Google sign-in failed. Try again.', 'error');
    }
  };

  // ── Forgot Password via Firebase ──────────────────────────
  const sendPasswordReset = async (email) => {
    if (!_ready) {
      Toast.show('Password reset requires Firebase. Contact support.', 'warning');
      return;
    }
    if (!email || !email.includes('@')) {
      Toast.show('Enter a valid email address first', 'error');
      return;
    }
    try {
      await _auth.sendPasswordResetEmail(email);
      Toast.show(`Reset link sent to ${email} — check your inbox 📧`, 'success', 5000);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        Toast.show('No account found with this email', 'error');
      } else {
        Toast.show('Could not send reset email. Try again.', 'error');
        console.warn('[SS GIFT] Password reset error:', err.message);
      }
    }
  };

  const signOut = async () => {
    if (_ready && _auth) { try { await _auth.signOut(); } catch (_) {} }
  };

  const isReady = () => _ready;

  return { init, signInWithGoogle, sendPasswordReset, signOut, isReady };
})();