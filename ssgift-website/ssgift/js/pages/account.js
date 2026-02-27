/**
 * SS GIFT — Auth + Account + Admin Page Renderers
 */

/* ════════════════════════════════════════════
   AUTH PAGE — No admin hint visible to users
   Google Sign-In button wired to FirebaseAuth
   ════════════════════════════════════════════ */
const AuthPage = (() => {
  const render = () => `
    <div class="auth-page">
      <div class="auth-card">

        <div class="auth-logo">
          <a class="logo" href="#" onclick="Router.go('home')">SS <span>GIFT</span></a>
        </div>
        <p class="auth-tagline">Sign in to track orders, save wishlists &amp; more 💕</p>

        <!-- Tab switcher -->
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login"    onclick="Auth.switchTab('login')">Sign In</button>
          <button class="auth-tab"        data-tab="register" onclick="Auth.switchTab('register')">Create Account</button>
        </div>

        <!-- ── LOGIN FORM ── -->
        <div class="auth-form active" id="loginForm">

          <!-- Google Sign-In -->
          <button class="btn-google" onclick="Auth.loginWithGoogle()">
            <span class="btn-google__icon"></span>
            Continue with Google
          </button>

          <div class="auth-divider">or sign in with email</div>

          <div class="form-group">
            <label>Email Address</label>
            <input class="form-input" type="email" id="loginEmail" placeholder="you@email.com"
              autocomplete="email"/>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input class="form-input" type="password" id="loginPass" placeholder="••••••••"
              autocomplete="current-password"
              onkeydown="if(event.key==='Enter') Auth.login()"/>
          </div>

          <button class="btn btn--primary btn--full btn--lg" onclick="Auth.login()">
            <i class="fas fa-sign-in-alt"></i> Sign In
          </button>

          <p class="auth-switch">
            New here?
            <button onclick="Auth.switchTab('register')">Create a free account</button>
          </p>
        </div>

        <!-- ── REGISTER FORM ── -->
        <div class="auth-form" id="registerForm">

          <!-- Google Sign-Up -->
          <button class="btn-google" onclick="Auth.loginWithGoogle()">
            <span class="btn-google__icon"></span>
            Sign up with Google
          </button>

          <div class="auth-divider">or register with email</div>

          <div class="form-group">
            <label>Full Name <span style="color:var(--color-rose)">*</span></label>
            <input class="form-input" type="text" id="regName" placeholder="Your full name"
              autocomplete="name"/>
          </div>
          <div class="form-group">
            <label>Email Address <span style="color:var(--color-rose)">*</span></label>
            <input class="form-input" type="email" id="regEmail" placeholder="you@email.com"
              autocomplete="email"/>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input class="form-input" type="tel" id="regPhone" placeholder="+91 XXXXXXXXXX"
              autocomplete="tel"/>
          </div>
          <div class="form-group">
            <label>Password <span style="color:var(--color-rose)">*</span></label>
            <input class="form-input" type="password" id="regPass" placeholder="Min. 6 characters"
              autocomplete="new-password"
              onkeydown="if(event.key==='Enter') Auth.register()"/>
          </div>

          <button class="btn btn--primary btn--full btn--lg" onclick="Auth.register()">
            <i class="fas fa-user-plus"></i> Create Account
          </button>

          <p class="auth-switch">
            Already have an account?
            <button onclick="Auth.switchTab('login')">Sign in</button>
          </p>
        </div>

      </div>
    </div>`;

  return { render };
})();


/* ════════════════════════════════════════════
   ACCOUNT PAGE
   ════════════════════════════════════════════ */
const AccountPage = (() => {

  const render = () => {
    const u = Store.getCurrentUser();
    if (!u) { Router.go('auth'); return ''; }

    const orders    = Store.getOrders().filter(o => o.userId === u.id);
    const wishlist  = Store.getWishlist();
    const wishProds = Store.getProducts().filter(p => wishlist.includes(p.id));

    // Build avatar: photo (Google) or initial letter
    const avatarInner = u.photo
      ? `<img src="${u.photo}" alt="${u.name}" onerror="this.parentElement.innerHTML='${(u.name||'U')[0].toUpperCase()}'">`
      : (u.name || 'U')[0].toUpperCase();

    return `
      <div class="account-layout">

        <!-- ── Sidebar ── -->
        <aside class="account-sidebar">
          <div class="account-avatar">${avatarInner}</div>
          <div class="account-name"  title="${u.name}">${u.name}</div>
          <div class="account-email" title="${u.email}">${u.email}</div>

          <ul class="account-menu">
            <li><a class="active" onclick="AccountPage.switchSection('orders',this)">
              <i class="fas fa-box"></i> My Orders
              ${orders.length ? `<span style="margin-left:auto;background:var(--color-rose);color:#fff;font-size:.6rem;padding:1px 7px;border-radius:99px;">${orders.length}</span>` : ''}
            </a></li>
            <li><a onclick="AccountPage.switchSection('wishlist',this)">
              <i class="fas fa-heart"></i> Wishlist
              ${wishlist.length ? `<span style="margin-left:auto;background:var(--color-rose);color:#fff;font-size:.6rem;padding:1px 7px;border-radius:99px;">${wishlist.length}</span>` : ''}
            </a></li>
            <li><a onclick="AccountPage.switchSection('profile',this)">
              <i class="fas fa-user-edit"></i> Profile
            </a></li>
            <li><a class="logout" onclick="Auth.logout()">
              <i class="fas fa-sign-out-alt"></i> Sign Out
            </a></li>
          </ul>
        </aside>

        <!-- ── Content ── -->
        <div class="account-content">

          <!-- Orders -->
          <div class="account-section active" id="acc-orders">
            <h3>My Orders</h3>
            ${orders.length ? orders.map(o => `
              <div class="order-card">
                <div class="order-card__header">
                  <div>
                    <div class="order-card__id">Order #${o.id}</div>
                    <div class="order-card__date">${o.date}</div>
                  </div>
                  <span class="badge-status badge-${o.status.toLowerCase()}">${o.status}</span>
                </div>
                <div class="order-card__items">${o.items.map(i => `${i.name} × ${i.qty}`).join(' · ')}</div>
                <div class="order-card__total">Total: ₹${o.total}</div>
              </div>`).join('')
            : `<div class="empty-state">
                <div class="empty-state__icon">📦</div>
                <h3 class="empty-state__title">No orders yet</h3>
                <p class="empty-state__desc">Your orders will appear here after you shop</p>
                <button class="btn btn--primary btn--md" onclick="Router.go('shop')">
                  <i class="fas fa-store"></i> Shop Now
                </button>
               </div>`}
          </div>

          <!-- Wishlist -->
          <div class="account-section" id="acc-wishlist">
            <h3>My Wishlist</h3>
            ${wishProds.length
              ? `<div class="products-grid products-grid--3">${wishProds.map(p => UI.productCard(p)).join('')}</div>`
              : `<div class="empty-state">
                  <div class="empty-state__icon">💔</div>
                  <h3 class="empty-state__title">Wishlist is empty</h3>
                  <p class="empty-state__desc">Tap the heart on any product to save it here</p>
                  <button class="btn btn--primary btn--md" onclick="Router.go('shop')">Explore Gifts</button>
                 </div>`}
          </div>

          <!-- Profile -->
          <div class="account-section" id="acc-profile">
            <h3>My Profile</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name</label>
                <input class="form-input" type="text" id="profName" value="${u.name || ''}"/>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input class="form-input" type="email" id="profEmail"
                  value="${u.email || ''}" readonly title="Email cannot be changed"/>
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input class="form-input" type="tel" id="profPhone" value="${u.phone || ''}"
                  placeholder="+91 XXXXXXXXXX"/>
              </div>
              ${u.provider === 'google' ? `
              <div class="form-group form-group--full">
                <div style="background:var(--color-rose-ghost);border:1px solid var(--color-rose-soft);border-radius:var(--r-md);padding:var(--s3) var(--s4);font-size:var(--text-xs);color:var(--color-rose);display:flex;align-items:center;gap:var(--s2);">
                  <span class="btn-google__icon" style="width:14px;height:14px;flex-shrink:0"></span>
                  Signed in with Google · Password managed by your Google account
                </div>
              </div>` : ''}
            </div>
            <button class="btn btn--primary btn--md" style="margin-top:var(--s6)"
              onclick="AccountPage.saveProfile()">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </div>

        </div>
      </div>`;
  };

  const switchSection = (sec, el) => {
    document.querySelectorAll('.account-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.account-menu a').forEach(a => a.classList.remove('active'));
    document.getElementById(`acc-${sec}`)?.classList.add('active');
    el?.classList.add('active');
  };

  const saveProfile = () => {
    const u = Store.getCurrentUser();
    if (!u) return;
    const name  = document.getElementById('profName')?.value?.trim();
    const phone = document.getElementById('profPhone')?.value?.trim();
    if (!name) { Toast.show('Name cannot be empty', 'error'); return; }
    u.name = name; u.phone = phone;
    Store.setCurrentUser(u);
    const users = Store.getUsers();
    const idx   = users.findIndex(x => x.id === u.id);
    if (idx >= 0) { users[idx].name = name; users[idx].phone = phone; Store.setUsers(users); }
    Toast.show('Profile updated!', 'success');
    UI.renderAuthArea();
    // Refresh sidebar display
    const nameEl  = document.querySelector('.account-name');
    const emailEl = document.querySelector('.account-email');
    if (nameEl)  nameEl.textContent  = name;
    if (emailEl) emailEl.textContent = u.email;
  };

  return { render, switchSection, saveProfile };
})();


/* ════════════════════════════════════════════
   ADMIN PAGE — Responsive + Mobile Tab Nav
   ════════════════════════════════════════════ */
const AdminPage = (() => {
  const render = () => `
    <div class="admin-wrap">

      <!-- Desktop Sidebar -->
      <aside class="admin-sidebar">
        <div class="admin-sidebar__brand">
          <span style="font-size:1.1rem">⚙️</span> Admin Panel
        </div>
        <ul class="admin-menu">
          <li><a class="active" data-sec="dashboard" onclick="Admin.switchSection('dashboard')"><i class="fas fa-chart-bar"></i> Dashboard</a></li>
          <li><a data-sec="products"  onclick="Admin.switchSection('products')"><i class="fas fa-gift"></i> Products</a></li>
          <li><a data-sec="orders"    onclick="Admin.switchSection('orders')"><i class="fas fa-box"></i> Orders</a></li>
          <li><a data-sec="users"     onclick="Admin.switchSection('users')"><i class="fas fa-users"></i> Users</a></li>
          <li><a data-sec="coupons"   onclick="Admin.switchSection('coupons')"><i class="fas fa-tag"></i> Coupons</a></li>
        </ul>
        <ul class="admin-menu" style="margin-top:auto;border-top:1px solid var(--color-border);padding-top:var(--s4)">
          <li><a onclick="Router.go('home')"><i class="fas fa-external-link-alt"></i> View Shop</a></li>
          <li><a class="danger" onclick="Auth.logout()"><i class="fas fa-sign-out-alt"></i> Sign Out</a></li>
        </ul>
      </aside>

      <!-- Main -->
      <div class="admin-main">

        <div class="admin-section active" id="adm-dashboard">
          <h2>Dashboard</h2>
          <div class="stats-grid" id="adminStats"></div>
          <h3 style="font-family:var(--font-display);font-size:1.3rem;margin-bottom:var(--s4);color:var(--color-text)">Recent Orders</h3>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody id="recentOrdersBody"></tbody>
            </table>
          </div>
        </div>

        <div class="admin-section" id="adm-products">
          <h2>Products</h2>
          <div class="admin-toolbar">
            <button class="btn btn--primary btn--md" onclick="Admin.openProductModal()"><i class="fas fa-plus"></i> Add Product</button>
            <input class="admin-search" type="text" id="admProdSearch" placeholder="Search products…" oninput="Admin.renderProducts()"/>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody id="adminProductsBody"></tbody>
            </table>
          </div>
        </div>

        <div class="admin-section" id="adm-orders">
          <h2>Orders</h2>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Notify</th></tr></thead>
              <tbody id="adminOrdersBody"></tbody>
            </table>
          </div>
        </div>

        <div class="admin-section" id="adm-users">
          <h2>Users</h2>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody id="adminUsersBody"></tbody>
            </table>
          </div>
        </div>

        <div class="admin-section" id="adm-coupons">
          <h2>Coupons</h2>
          <div class="admin-toolbar">
            <button class="btn btn--primary btn--md" onclick="Admin.openCouponModal()"><i class="fas fa-plus"></i> Add Coupon</button>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Code</th><th>Value</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody id="adminCouponsBody"></tbody>
            </table>
          </div>
        </div>

      </div><!-- /admin-main -->

      <!-- Mobile Bottom Tab Nav -->
      <nav class="admin-tab-nav">
        <div class="admin-tab-nav__items">
          <button class="admin-tab-nav__item active" data-sec="dashboard" onclick="Admin.switchSection('dashboard')">
            <i class="fas fa-chart-bar"></i> Stats
          </button>
          <button class="admin-tab-nav__item" data-sec="products" onclick="Admin.switchSection('products')">
            <i class="fas fa-gift"></i> Products
          </button>
          <button class="admin-tab-nav__item" data-sec="orders" onclick="Admin.switchSection('orders')">
            <i class="fas fa-box"></i> Orders
          </button>
          <button class="admin-tab-nav__item" data-sec="users" onclick="Admin.switchSection('users')">
            <i class="fas fa-users"></i> Users
          </button>
          <button class="admin-tab-nav__item" data-sec="coupons" onclick="Admin.switchSection('coupons')">
            <i class="fas fa-tag"></i> Coupons
          </button>
        </div>
      </nav>

    </div>`;

  return { render };
})();