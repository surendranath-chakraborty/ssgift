/**
 * SS GIFT — Authentication Module
 */
const Auth = (() => {

  /* ── Tab Switch ── */
  const switchTab = (tab) => {
    document.querySelectorAll('.auth-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('loginForm')?.classList.toggle('active',    tab === 'login');
    document.getElementById('registerForm')?.classList.toggle('active', tab === 'register');
  };

  /* ── Show / Hide Password ── */
  const togglePassword = (inputId, btn) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) icon.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
  };

  /* ── Forgot Password ── */
  const forgotPassword = () => {
    // Pre-fill with whatever is already typed in the email box
    const prefill = document.getElementById('loginEmail')?.value?.trim() || '';

    Modal.open('Reset Password', `
      <div style="display:flex;flex-direction:column;gap:var(--s4)">
        <p style="font-size:var(--text-sm);color:var(--color-muted);line-height:1.7">
          Enter your email and we'll send a password reset link instantly.
        </p>
        <div class="form-group">
          <label>Email Address</label>
          <input class="form-input" type="email" id="resetEmail"
            placeholder="you@email.com" value="${prefill}"
            onkeydown="if(event.key==='Enter') Auth._doReset()"/>
        </div>
        <button class="btn btn--primary btn--full btn--md" onclick="Auth._doReset()">
          <i class="fas fa-paper-plane"></i> Send Reset Link
        </button>
        <p style="font-size:var(--text-xs);color:var(--color-muted);text-align:center">
          Check spam/junk if you don't see it within a minute.
        </p>
      </div>`);

    setTimeout(() => {
      const el = document.getElementById('resetEmail');
      if (el) { el.focus(); el.select(); }
    }, 120);
  };

  const _doReset = () => {
    const email = document.getElementById('resetEmail')?.value?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      Toast.show('Enter a valid email address', 'error');
      return;
    }
    FirebaseAuth.sendPasswordReset(email);
    Modal.close();
  };

  /* ── Login ── */
  const login = () => {
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

    const users = Store.getUsers();
    const user  = users.find(u => u.email === email && u.password === pass);
    if (!user)        { Toast.show('Invalid email or password', 'error'); return; }
    if (user.blocked) { Toast.show('Account suspended. Contact support.', 'error'); return; }
    Store.setCurrentUser({ ...user, isAdmin:false });
    UI.renderAuthArea();
    Toast.show(`Welcome back, ${user.name.split(' ')[0]}! 🎉`, 'success');
    Router.go('account');
  };

  /* ── Register ── */
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

  /* ── Google ── */
  const loginWithGoogle = () => FirebaseAuth.signInWithGoogle();

  /* ── Logout ── */
  const logout = () => {
    FirebaseAuth.signOut();
    Store.clearSession();
    UI.renderAuthArea();
    Toast.show('Logged out successfully', 'info');
    Router.go('home');
  };

  return { switchTab, togglePassword, forgotPassword, _doReset, login, register, loginWithGoogle, logout };
})();