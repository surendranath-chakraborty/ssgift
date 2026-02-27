/**
 * SS GIFT — Account & Auth & Admin Page Renderers
 */

// ---- AUTH PAGE ----
const AuthPage = (() => {
  const render = () => `
    <div class="auth-wrap">
      <div class="auth-box">
        <div class="auth-logo">
          <a class="logo" href="#">SS <span>GIFT</span></a>
          <p>Welcome back to love's favourite store 💕</p>
        </div>
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login" onclick="Auth.switchTab('login')">Login</button>
          <button class="auth-tab" data-tab="register" onclick="Auth.switchTab('register')">Register</button>
        </div>

        <!-- Login Form -->
        <div class="auth-form active" id="loginForm">
          <div class="form-group">
            <label>Email Address</label>
            <input class="form-input" type="email" id="loginEmail" placeholder="you@email.com"/>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input class="form-input" type="password" id="loginPass" placeholder="••••••••"
              onkeydown="if(event.key==='Enter') Auth.login()"/>
          </div>
          <button class="btn btn--primary btn--full btn--lg" onclick="Auth.login()">
            <i class="fas fa-sign-in-alt"></i> Login
          </button>
          <div class="admin-hint">
            🔐 Admin Access:<br>
            <strong>admin@ssgift.com</strong> / <strong>ssgift@2024</strong>
          </div>
        </div>

        <!-- Register Form -->
        <div class="auth-form" id="registerForm">
          <div class="form-group">
            <label>Full Name *</label>
            <input class="form-input" type="text" id="regName" placeholder="Your full name"/>
          </div>
          <div class="form-group">
            <label>Email Address *</label>
            <input class="form-input" type="email" id="regEmail" placeholder="you@email.com"/>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input class="form-input" type="tel" id="regPhone" placeholder="+91 XXXXXXXXXX"/>
          </div>
          <div class="form-group">
            <label>Password *</label>
            <input class="form-input" type="password" id="regPass" placeholder="Min. 6 characters"
              onkeydown="if(event.key==='Enter') Auth.register()"/>
          </div>
          <button class="btn btn--primary btn--full btn--lg" onclick="Auth.register()">
            <i class="fas fa-user-plus"></i> Create Account
          </button>
        </div>
      </div>
    </div>`;
  return { render };
})();

// ---- ACCOUNT PAGE ----
const AccountPage = (() => {
  const render = () => {
    const u = Store.getCurrentUser();
    if (!u) { Router.go('auth'); return ''; }

    const orders   = Store.getOrders().filter(o => o.userId === u.id);
    const wishlist = Store.getWishlist();
    const wishProds = Store.getProducts().filter(p => wishlist.includes(p.id));

    return `
      <div class="account-layout">
        <!-- Sidebar -->
        <aside class="account-sidebar">
          <div class="account-avatar">${(u.name || 'U')[0].toUpperCase()}</div>
          <div class="account-name">${u.name}</div>
          <div class="account-email">${u.email}</div>
          <ul class="account-menu">
            <li><a href="#" class="active" data-sec="orders" onclick="AccountPage.switchSection('orders', this)"><i class="fas fa-box"></i> My Orders</a></li>
            <li><a href="#" data-sec="wishlist" onclick="AccountPage.switchSection('wishlist', this)"><i class="fas fa-heart"></i> Wishlist</a></li>
            <li><a href="#" data-sec="profile" onclick="AccountPage.switchSection('profile', this)"><i class="fas fa-user"></i> Profile</a></li>
            <li><a href="#" class="logout" onclick="Auth.logout()"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
          </ul>
        </aside>

        <!-- Content -->
        <div class="account-content">
          <!-- Orders -->
          <div class="account-section active" id="acc-orders">
            <h3>My Orders 📦</h3>
            ${orders.length
              ? orders.map(o => `
                  <div class="order-card">
                    <div class="order-card__header">
                      <div>
                        <div class="order-card__id">Order #${o.id}</div>
                        <div class="order-card__date">${o.date}</div>
                      </div>
                      <span class="badge-status badge-${o.status.toLowerCase()}">${o.status}</span>
                    </div>
                    <div class="order-card__items">${o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}</div>
                    <div class="order-card__total">₹${o.total}</div>
                  </div>`).join('')
              : `<div class="empty-state">
                   <div class="empty-state__icon">📦</div>
                   <h3 class="empty-state__title">No orders yet</h3>
                   <p class="empty-state__desc">Start shopping and your orders will appear here</p>
                   <button class="btn btn--primary btn--md" onclick="Router.go('shop')">Shop Now</button>
                 </div>`}
          </div>

          <!-- Wishlist -->
          <div class="account-section" id="acc-wishlist">
            <h3>My Wishlist ❤️</h3>
            ${wishProds.length
              ? `<div class="products-grid">${wishProds.map(p => UI.productCard(p)).join('')}</div>`
              : `<div class="empty-state">
                   <div class="empty-state__icon">💔</div>
                   <h3 class="empty-state__title">Wishlist is empty</h3>
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
                <input class="form-input" type="email" id="profEmail" value="${u.email || ''}" readonly style="opacity:0.6"/>
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input class="form-input" type="tel" id="profPhone" value="${u.phone || ''}"/>
              </div>
            </div>
            <button class="btn btn--primary btn--md" style="margin-top:var(--space-6)" onclick="AccountPage.saveProfile()">
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
    u.name  = document.getElementById('profName')?.value?.trim();
    u.phone = document.getElementById('profPhone')?.value?.trim();
    Store.setCurrentUser(u);
    const users = Store.getUsers();
    const idx   = users.findIndex(x => x.id === u.id);
    if (idx >= 0) { users[idx].name = u.name; users[idx].phone = u.phone; Store.setUsers(users); }
    Toast.show('Profile updated successfully!', 'success');
    UI.renderAuthArea();
  };

  return { render, switchSection, saveProfile };
})();

// ---- ADMIN PAGE ----
const AdminPage = (() => {
  const render = () => `
    <div class="admin-wrap">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar">
        <div class="admin-sidebar__brand">⚙️ SS GIFT Admin</div>
        <ul class="admin-menu">
          <li><a href="#" class="active" data-sec="dashboard" onclick="Admin.switchSection('dashboard')"><i class="fas fa-chart-bar"></i> Dashboard</a></li>
          <li><a href="#" data-sec="products"  onclick="Admin.switchSection('products')"><i class="fas fa-gift"></i> Products</a></li>
          <li><a href="#" data-sec="orders"    onclick="Admin.switchSection('orders')"><i class="fas fa-box"></i> Orders</a></li>
          <li><a href="#" data-sec="users"     onclick="Admin.switchSection('users')"><i class="fas fa-users"></i> Users</a></li>
          <li><a href="#" data-sec="coupons"   onclick="Admin.switchSection('coupons')"><i class="fas fa-ticket-alt"></i> Coupons</a></li>
          <li style="margin-top:auto"><a href="#" onclick="Router.go('home')"><i class="fas fa-external-link-alt"></i> View Site</a></li>
          <li><a href="#" class="danger" onclick="Auth.logout()"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
        </ul>
      </aside>

      <!-- Admin Main -->
      <div class="admin-main">
        <!-- Dashboard -->
        <div class="admin-section active" id="adm-dashboard">
          <h2>📊 Dashboard</h2>
          <div class="stats-grid" id="adminStats"></div>
          <h3 style="font-family:var(--font-display);font-size:1.3rem;margin-bottom:var(--space-4)">Recent Orders</h3>
          <table class="admin-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody id="recentOrdersBody"></tbody>
          </table>
        </div>

        <!-- Products -->
        <div class="admin-section" id="adm-products">
          <h2>🎁 Products</h2>
          <div class="admin-toolbar">
            <button class="btn btn--primary btn--md" onclick="Admin.openProductModal()">
              <i class="fas fa-plus"></i> Add Product
            </button>
            <input class="admin-search" type="text" id="admProdSearch" placeholder="Search products..." oninput="Admin.renderProducts()"/>
          </div>
          <table class="admin-table">
            <thead><tr><th>Icon</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody id="adminProductsBody"></tbody>
          </table>
        </div>

        <!-- Orders -->
        <div class="admin-section" id="adm-orders">
          <h2>📦 Orders</h2>
          <table class="admin-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Notify</th></tr></thead>
            <tbody id="adminOrdersBody"></tbody>
          </table>
        </div>

        <!-- Users -->
        <div class="admin-section" id="adm-users">
          <h2>👥 Users</h2>
          <table class="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="adminUsersBody"></tbody>
          </table>
        </div>

        <!-- Coupons -->
        <div class="admin-section" id="adm-coupons">
          <h2>🎟️ Coupons</h2>
          <div class="admin-toolbar">
            <button class="btn btn--primary btn--md" onclick="Admin.openCouponModal()">
              <i class="fas fa-plus"></i> Add Coupon
            </button>
          </div>
          <table class="admin-table">
            <thead><tr><th>Code</th><th>Value</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="adminCouponsBody"></tbody>
          </table>
        </div>
      </div>
    </div>`;

  return { render };
})();
