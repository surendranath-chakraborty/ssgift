/**
 * SS GIFT — Authentication Module
 * Admin credentials are secret — no visible hint shown on login page.
 */
const Auth = (() => {

  const switchTab = (tab) => {
    document.querySelectorAll('.auth-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('loginForm')?.classList.toggle('active',    tab === 'login');
    document.getElementById('registerForm')?.classList.toggle('active', tab === 'register');
  };

  const login = () => {
    const email = document.getElementById('loginEmail')?.value?.trim().toLowerCase();
    const pass  = document.getElementById('loginPass')?.value;
    if (!email || !pass) { Toast.show('Please fill in all fields', 'error'); return; }

    // Admin — silent check, no UI hint
    if (email === CONFIG.ADMIN_EMAIL && pass === CONFIG.ADMIN_PASS) {
      Store.setCurrentUser({ id:'admin', name:'Admin', email:CONFIG.ADMIN_EMAIL, isAdmin:true, photo:'' });
      UI.renderAuthArea();
      Toast.show('Welcome back, Admin 👑', 'success');
      Router.go('admin');
      return;
    }

    const users = Store.getUsers();
    const user  = users.find(u => u.email === email && u.password === pass);
    if (!user)        { Toast.show('Invalid email or password', 'error'); return; }
    if (user.blocked) { Toast.show('Account suspended. Contact support.', 'error'); return; }
    Store.setCurrentUser({ ...user, isAdmin: false });
    UI.renderAuthArea();
    Toast.show(`Welcome back, ${user.name.split(' ')[0]}! 🎉`, 'success');
    Router.go('account');
  };

  const register = () => {
    const name  = document.getElementById('regName')?.value?.trim();
    const email = document.getElementById('regEmail')?.value?.trim().toLowerCase();
    const phone = document.getElementById('regPhone')?.value?.trim();
    const pass  = document.getElementById('regPass')?.value;
    if (!name || !email || !pass) { Toast.show('Please fill all required fields', 'error'); return; }
    if (pass.length < 6)          { Toast.show('Password must be at least 6 characters', 'error'); return; }
    if (!email.includes('@'))     { Toast.show('Enter a valid email address', 'error'); return; }
    const users = Store.getUsers();
    if (users.find(u => u.email === email)) { Toast.show('Email already registered. Please login.', 'error'); return; }
    const newUser = {
      id:'u'+Date.now(), name, email, phone,
      password:pass, provider:'email', photo:'', blocked:false,
      createdAt:new Date().toLocaleDateString('en-IN'),
    };
    users.push(newUser);
    Store.setUsers(users);
    Store.setCurrentUser({ ...newUser, isAdmin:false });
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