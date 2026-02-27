/**
 * SS GIFT — Authentication Module
 * - Email/password login synced to Firestore
 * - Google Sign-In via Firebase Auth (redirect method)
 * - Works across all devices (phone, laptop, tablet)
 */
const Auth = (() => {

  const switchTab = (tab) => {
    document.querySelectorAll('.auth-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('loginForm')?.classList.toggle('active',    tab === 'login');
    document.getElementById('registerForm')?.classList.toggle('active', tab === 'register');
  };

  // ── Hash password (simple but better than plain text) ───────
  const _hashPass = async (pass) => {
    const encoder = new TextEncoder();
    const data     = encoder.encode(pass + 'ssgift_salt_2024');
    const hash     = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
  };

  // ── Login ────────────────────────────────────────────────────
  const login = async () => {
    const email = document.getElementById('loginEmail')?.value?.trim().toLowerCase();
    const pass  = document.getElementById('loginPass')?.value;
    if (!email || !pass) { Toast.show('Please fill in all fields', 'error'); return; }

    // Admin — silent check
    if (email === CONFIG.ADMIN_EMAIL && pass === CONFIG.ADMIN_PASS) {
      Store.setCurrentUser({ id:'admin', name:'Admin', email:CONFIG.ADMIN_EMAIL, isAdmin:true, photo:'' });
      UI.renderAuthArea();
      Toast.show('Welcome back, Admin 👑', 'success');
      Router.go('admin');
      return;
    }

    // Try Firestore first (cross-device)
    let user = await Store.loadUserFromCloud(email);

    // Fallback to localStorage
    if (!user) {
      const users = Store.getUsers();
      user = users.find(u => u.email === email);
    }

    if (!user) { Toast.show('No account found. Please register.', 'error'); return; }
    if (user.blocked) { Toast.show('Account suspended. Contact support.', 'error'); return; }

    // Check password — support both hashed and legacy plain text
    const hashed = await _hashPass(pass);
    const passOk = user.password === hashed || user.password === pass;
    if (!passOk) { Toast.show('Invalid email or password', 'error'); return; }

    // If legacy plain password — upgrade to hashed
    if (user.password === pass) {
      user.password = hashed;
      await Store.syncUserToCloud(user);
      const localUsers = Store.getUsers();
      const idx = localUsers.findIndex(u => u.email === email);
      if (idx > -1) { localUsers[idx].password = hashed; Store.setUsers(localUsers); }
    }

    Store.setCurrentUser({ ...user, isAdmin: false });
    UI.renderAuthArea();
    Toast.show(`Welcome back, ${user.name.split(' ')[0]}! 🎉`, 'success');
    Router.go('account');
  };

  // ── Register ─────────────────────────────────────────────────
  const register = async () => {
    const name  = document.getElementById('regName')?.value?.trim();
    const email = document.getElementById('regEmail')?.value?.trim().toLowerCase();
    const phone = document.getElementById('regPhone')?.value?.trim();
    const pass  = document.getElementById('regPass')?.value;

    if (!name || !email || !pass) { Toast.show('Please fill all required fields', 'error'); return; }
    if (pass.length < 6)          { Toast.show('Password must be at least 6 characters', 'error'); return; }
    if (!email.includes('@'))     { Toast.show('Enter a valid email address', 'error'); return; }

    // Check Firestore + localStorage for existing email
    const cloudUser = await Store.loadUserFromCloud(email);
    const localUsers = Store.getUsers();
    if (cloudUser || localUsers.find(u => u.email === email)) {
      Toast.show('Email already registered. Please login.', 'error');
      return;
    }

    const hashed = await _hashPass(pass);
    const newUser = {
      id:        'u' + Date.now(),
      name,
      email,
      phone:     phone || '',
      password:  hashed,
      provider:  'email',
      photo:     '',
      blocked:   false,
      createdAt: new Date().toLocaleDateString('en-IN'),
    };

    // Save to both localStorage and Firestore
    localUsers.push(newUser);
    Store.setUsers(localUsers);
    await Store.syncUserToCloud(newUser);

    Store.setCurrentUser({ ...newUser, isAdmin: false });
    UI.renderAuthArea();
    Toast.show(`Welcome, ${name.split(' ')[0]}! 🎁`, 'success');
    Router.go('account');
  };

  const loginWithGoogle = () => { FirebaseAuth.signInWithGoogle(); };

  const logout = () => {
    FirebaseAuth.signOut();
    Store.clearSession();
    UI.renderAuthArea();
    Toast.show('Logged out successfully', 'info');
    Router.go('home');
  };

  return { switchTab, login, register, loginWithGoogle, logout };
})();