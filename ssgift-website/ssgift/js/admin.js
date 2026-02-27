/**
 * SS GIFT — Admin Module
 */
const Admin = (() => {
  let _editingProductId = null;

  /* ---- Switch Sections ---- */
  const switchSection = (sec) => {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`adm-${sec}`)?.classList.add('active');
    document.querySelectorAll('.admin-menu a').forEach(a => {
      a.classList.toggle('active', a.dataset.sec === sec);
    });
    const renders = { dashboard: renderDashboard, products: renderProducts, orders: renderOrders, users: renderUsers, coupons: renderCoupons };
    if (renders[sec]) renders[sec]();
  };

  /* ---- Dashboard ---- */
  const renderDashboard = () => {
    const products = Store.getProducts();
    const orders   = Store.getOrders();
    const users    = Store.getUsers();
    const revenue  = orders.reduce((s, o) => s + o.total, 0);

    const stats = document.getElementById('adminStats');
    if (stats) {
      stats.innerHTML = [
        { icon:'🎁', val: products.length, label: 'Total Products' },
        { icon:'📦', val: orders.length,   label: 'Total Orders'   },
        { icon:'👥', val: users.length,    label: 'Registered Users'},
        { icon:'💰', val: `₹${revenue}`,  label: 'Total Revenue'   },
      ].map(s => `
        <div class="stat-card fade-up">
          <div class="stat-card__icon">${s.icon}</div>
          <div class="stat-card__val">${s.val}</div>
          <div class="stat-card__label">${s.label}</div>
        </div>`).join('');
    }

    const tbody = document.getElementById('recentOrdersBody');
    if (tbody) {
      tbody.innerHTML = orders.slice(0, 5).map(o => `
        <tr>
          <td><strong>#${o.id}</strong></td>
          <td>${o.customer}</td>
          <td>₹${o.total}</td>
          <td><span class="badge-status badge-${o.status.toLowerCase()}">${o.status}</span></td>
          <td>${o.date}</td>
        </tr>`).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--color-muted);padding:var(--space-6)">No orders yet</td></tr>`;
    }
  };

  /* ---- Products ---- */
  const renderProducts = () => {
    const search   = document.getElementById('admProdSearch')?.value?.toLowerCase() || '';
    const products = Store.getProducts().filter(p => !search || p.name.toLowerCase().includes(search));
    const tbody    = document.getElementById('adminProductsBody');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => `
      <tr>
        <td style="font-size:1.5rem">${p.emoji}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.cat}</td>
        <td>₹${p.price} <span style="text-decoration:line-through;color:var(--color-muted);font-size:var(--text-xs)">₹${p.original}</span></td>
        <td>${p.stock}</td>
        <td>
          <button class="action-btn action-btn--edit" onclick="Admin.openProductModal(${p.id})"><i class="fas fa-edit"></i></button>
          <button class="action-btn action-btn--del"  onclick="Admin.deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--color-muted);padding:var(--space-6)">No products found</td></tr>`;
  };

  /* ---- Orders ---- */
  const renderOrders = () => {
    const orders = Store.getOrders();
    const tbody  = document.getElementById('adminOrdersBody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${o.customer}<br><small style="color:var(--color-muted)">${o.phone}</small></td>
        <td>${o.items.length} item(s)</td>
        <td>₹${o.total}</td>
        <td>
          <select onchange="Admin.updateOrderStatus('${o.id}', this.value)"
            style="border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:4px 8px;font-size:var(--text-xs);font-family:var(--font-body);outline:none">
            ${['Processing','Shipped','Delivered','Cancelled'].map(s =>
              `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td>
          <button class="action-btn action-btn--ok" onclick="Admin.notifyCustomer('${o.id}')" title="WhatsApp Customer">
            <i class="fab fa-whatsapp"></i>
          </button>
        </td>
      </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--color-muted);padding:var(--space-6)">No orders yet</td></tr>`;
  };

  /* ---- Users ---- */
  const renderUsers = () => {
    const users = Store.getUsers();
    const tbody = document.getElementById('adminUsersBody');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone || '—'}</td>
        <td>${Store.getOrders().filter(o => o.userId === u.id).length}</td>
        <td><span class="badge-status ${u.blocked ? 'badge-blocked' : 'badge-active'}">${u.blocked ? 'Blocked' : 'Active'}</span></td>
        <td>
          <button class="action-btn ${u.blocked ? 'action-btn--ok' : 'action-btn--del'}" onclick="Admin.toggleUserBlock('${u.id}')">
            ${u.blocked ? 'Unblock' : 'Block'}
          </button>
        </td>
      </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--color-muted);padding:var(--space-6)">No users registered yet</td></tr>`;
  };

  /* ---- Coupons ---- */
  const renderCoupons = () => {
    const coupons = Store.getCoupons();
    const tbody   = document.getElementById('adminCouponsBody');
    if (!tbody) return;

    tbody.innerHTML = coupons.map((c, i) => `
      <tr>
        <td><strong style="letter-spacing:0.05em">${c.code}</strong></td>
        <td>${c.value}${c.type === 'percent' ? '%' : ' ₹'}</td>
        <td style="text-transform:capitalize">${c.type}</td>
        <td><span class="badge-status ${c.active ? 'badge-active' : 'badge-blocked'}">${c.active ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="action-btn action-btn--edit" onclick="Admin.toggleCoupon(${i})">${c.active ? 'Deactivate' : 'Activate'}</button>
          <button class="action-btn action-btn--del"  onclick="Admin.deleteCoupon(${i})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('');
  };

  /* ---- Product Modal ---- */
  const openProductModal = (id = null) => {
    _editingProductId = id;
    const p    = id ? Store.getProductById(id) : null;
    const cats = CATEGORIES.map(c => c.name);

    Modal.open(id ? 'Edit Product' : 'Add New Product', `
      <div class="form-grid">
        <div class="form-group">
          <label>Product Name *</label>
          <input class="form-input" type="text" id="mpName" placeholder="e.g. Love Letter Box" value="${p ? p.name : ''}"/>
        </div>
        <div class="form-group">
          <label>Emoji Icon</label>
          <input class="form-input" type="text" id="mpEmoji" placeholder="🎁" maxlength="2" value="${p ? p.emoji : '🎁'}"/>
        </div>
        <div class="form-group">
          <label>Category *</label>
          <select class="form-input" id="mpCat">
            ${cats.map(c => `<option value="${c}" ${p && p.cat === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Price (₹) *</label>
          <input class="form-input" type="number" id="mpPrice" placeholder="499" value="${p ? p.price : ''}"/>
        </div>
        <div class="form-group">
          <label>Original Price (₹)</label>
          <input class="form-input" type="number" id="mpOriginal" placeholder="799" value="${p ? p.original : ''}"/>
        </div>
        <div class="form-group">
          <label>Stock</label>
          <input class="form-input" type="number" id="mpStock" placeholder="10" value="${p ? p.stock : 0}"/>
        </div>
        <div class="form-group form-group--full">
          <label>Description</label>
          <input class="form-input" type="text" id="mpDesc" placeholder="Short product description..." value="${p ? p.desc : ''}"/>
        </div>
        <div class="form-group form-group--full">
          <label>Tags (comma separated)</label>
          <input class="form-input" type="text" id="mpTags" placeholder="gift, couple, romantic" value="${p ? p.tags.join(', ') : ''}"/>
        </div>
      </div>
      <button class="btn btn--primary btn--full btn--md" style="margin-top:var(--space-6)" onclick="Admin.saveProduct()">
        <i class="fas fa-save"></i> ${id ? 'Update Product' : 'Add Product'}
      </button>`);
  };

  const saveProduct = () => {
    const name     = document.getElementById('mpName')?.value?.trim();
    const emoji    = document.getElementById('mpEmoji')?.value?.trim() || '🎁';
    const cat      = document.getElementById('mpCat')?.value;
    const price    = parseInt(document.getElementById('mpPrice')?.value || 0);
    const original = parseInt(document.getElementById('mpOriginal')?.value || price);
    const stock    = parseInt(document.getElementById('mpStock')?.value || 0);
    const desc     = document.getElementById('mpDesc')?.value?.trim() || '';
    const tags     = (document.getElementById('mpTags')?.value || '').split(',').map(t => t.trim()).filter(Boolean);

    if (!name || !price) { Toast.show('Name and price are required', 'error'); return; }

    let products = Store.getProducts();
    if (_editingProductId) {
      const idx = products.findIndex(p => p.id === _editingProductId);
      if (idx >= 0) products[idx] = { ...products[idx], name, emoji, cat, price, original, stock, desc, tags };
    } else {
      products.push({ id: Date.now(), name, emoji, cat, price, original, stock, desc, tags, rating: 5.0, reviews: 0 });
    }

    Store.setProducts(products);
    Modal.close();
    renderProducts();
    Toast.show(_editingProductId ? 'Product updated!' : 'Product added!', 'success');
  };

  const deleteProduct = (id) => {
    if (!confirm('Delete this product permanently?')) return;
    Store.setProducts(Store.getProducts().filter(p => p.id !== id));
    renderProducts();
    Toast.show('Product deleted', 'info');
  };

  /* ---- Coupon Modal ---- */
  const openCouponModal = () => {
    Modal.open('Add New Coupon', `
      <div class="form-grid">
        <div class="form-group">
          <label>Code *</label>
          <input class="form-input" type="text" id="mcCode" placeholder="LOVE10" style="text-transform:uppercase"/>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select class="form-input" id="mcType">
            <option value="percent">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>
        <div class="form-group form-group--full">
          <label>Value *</label>
          <input class="form-input" type="number" id="mcVal" placeholder="10 for 10% or 50 for ₹50"/>
        </div>
      </div>
      <button class="btn btn--primary btn--full btn--md" style="margin-top:var(--space-6)" onclick="Admin.saveCoupon()">
        <i class="fas fa-ticket-alt"></i> Add Coupon
      </button>`);
  };

  const saveCoupon = () => {
    const code  = document.getElementById('mcCode')?.value?.trim()?.toUpperCase();
    const type  = document.getElementById('mcType')?.value;
    const value = parseInt(document.getElementById('mcVal')?.value || 0);
    if (!code || !value) { Toast.show('Please fill all fields', 'error'); return; }
    const coupons = Store.getCoupons();
    coupons.push({ code, type, value, active: true });
    Store.setCoupons(coupons);
    Modal.close();
    renderCoupons();
    Toast.show('Coupon added!', 'success');
  };

  const toggleCoupon = (i) => {
    const coupons = Store.getCoupons();
    coupons[i].active = !coupons[i].active;
    Store.setCoupons(coupons);
    renderCoupons();
    Toast.show(`Coupon ${coupons[i].active ? 'activated' : 'deactivated'}`, 'info');
  };

  const deleteCoupon = (i) => {
    if (!confirm('Delete this coupon?')) return;
    const coupons = Store.getCoupons();
    coupons.splice(i, 1);
    Store.setCoupons(coupons);
    renderCoupons();
    Toast.show('Coupon deleted', 'info');
  };

  /* ---- Order Actions ---- */
  const updateOrderStatus = (orderId, status) => {
    const orders = Store.getOrders();
    const o = orders.find(x => x.id === orderId);
    if (o) { o.status = status; Store.setOrders(orders); Toast.show(`Order #${orderId} → ${status}`, 'success'); }
  };

  const notifyCustomer = (orderId) => {
    const o = Store.getOrders().find(x => x.id === orderId);
    if (!o) return;
    const msg = `Dear ${o.customer},\n\nYour order *#${o.id}* from SS GIFT has been updated.\nStatus: *${o.status}* ✅\n\nThank you for shopping with us! 🎁\n\n— SS GIFT Team`;
    const phone = o.phone.replace(/\D/g, '');
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`);
  };

  const toggleUserBlock = (uid) => {
    const users = Store.getUsers();
    const u = users.find(x => x.id === uid);
    if (u) { u.blocked = !u.blocked; Store.setUsers(users); renderUsers(); Toast.show(`User ${u.blocked ? 'blocked' : 'unblocked'}`, u.blocked ? 'warning' : 'success'); }
  };

  return {
    switchSection, renderDashboard, renderProducts, renderOrders, renderUsers, renderCoupons,
    openProductModal, saveProduct, deleteProduct,
    openCouponModal, saveCoupon, toggleCoupon, deleteCoupon,
    updateOrderStatus, notifyCustomer, toggleUserBlock,
  };
})();
