/**
 * SS GIFT — App Bootstrap
 * Registers all routes and initializes the application.
 */

// ---- REGISTER ALL ROUTES ----
Router.register('home',     ()          => HomePage.render());
Router.register('shop',     (p)         => ShopPage.render(p));
Router.register('product',  (p)         => ProductPage.render(p));
Router.register('cart',     ()          => renderCartPage());
Router.register('checkout', ()          => renderCheckoutPage());
Router.register('auth',     ()          => AuthPage.render());
Router.register('account',  ()          => AccountPage.render());
Router.register('admin',    ()          => AdminPage.render());
Router.register('wishlist', ()          => Wishlist.render());

// ---- CART PAGE RENDERER ----
function renderCartPage() {
  const cart = Store.getCart();
  Checkout.resetCoupon();

  if (!cart.length) {
    return `
      <div class="page-header">
        <button class="back-btn" onclick="Router.go('shop')"><i class="fas fa-arrow-left"></i> Continue Shopping</button>
        <h2 style="font-family:var(--font-display);font-size:var(--text-2xl)">Your Cart 🛒</h2>
      </div>
      <div class="empty-state">
        <div class="empty-state__icon">🛒</div>
        <h3 class="empty-state__title">Your cart is empty</h3>
        <p class="empty-state__desc">Looks like you haven't added anything yet</p>
        <button class="btn btn--primary btn--lg" onclick="Router.go('shop')">
          <i class="fas fa-store"></i> Start Shopping
        </button>
      </div>`;
  }

  const { subtotal, discount, delivery, total } = Cart.calcTotals(null);

  return `
    <div class="page-header">
      <button class="back-btn" onclick="Router.go('shop')"><i class="fas fa-arrow-left"></i> Continue Shopping</button>
      <h2 style="font-family:var(--font-display);font-size:var(--text-2xl)">Your Cart 🛒</h2>
    </div>
    <div class="cart-layout">
      <!-- Cart Items -->
      <div class="cart-items">
        ${cart.map(item => `
          <div class="cart-item">
            <div class="cart-item__img">${item.emoji}</div>
            <div class="cart-item__info">
              <div class="cart-item__name">${item.name}</div>
              <div class="cart-item__cat">${item.cat}</div>
              <div class="cart-item__price">₹${item.price} × ${item.qty} = <strong>₹${item.price * item.qty}</strong></div>
            </div>
            <div class="cart-item__actions">
              <button class="cart-item__remove" onclick="Cart.removeFromCart(${item.id})" title="Remove">
                <i class="fas fa-trash"></i>
              </button>
              <div class="qty-control">
                <button class="qty-control__btn" onclick="Cart.updateQty(${item.id}, -1)">−</button>
                <span class="qty-control__val">${item.qty}</span>
                <button class="qty-control__btn" onclick="Cart.updateQty(${item.id}, 1)">+</button>
              </div>
            </div>
          </div>`).join('')}
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Subtotal (${cart.reduce((s,c)=>s+c.qty,0)} items)</span><span id="summarySubtotal">₹${subtotal}</span></div>
        <div class="summary-row"><span>Discount</span><span id="summaryDisc" style="color:var(--color-success)">-₹${discount}</span></div>
        <div class="summary-row summary-row--delivery"><span>Delivery</span><span id="summaryDel">${delivery === 0 ? 'FREE 🎉' : '₹'+delivery}</span></div>
        <div class="summary-row summary-row--total"><span>Grand Total</span><span id="summaryTotal">₹${total}</span></div>

        <div class="coupon-row">
          <input class="coupon-input" type="text" id="couponInput" placeholder="Coupon code" style="text-transform:uppercase"/>
          <button class="btn btn--gold btn--md" onclick="Checkout.applyCoupon()">Apply</button>
        </div>
        <div id="couponMsg" class="coupon-msg"></div>
        <div class="coupon-hint">Available: LOVE10 · SS20 · GIFT15 · FLAT50</div>

        <button class="btn btn--primary btn--full btn--lg" onclick="Router.go('checkout')">
          Proceed to Checkout <i class="fas fa-arrow-right"></i>
        </button>
        <button class="btn btn--whatsapp btn--full btn--md" style="margin-top:var(--space-3)" onclick="orderCartWhatsApp()">
          <i class="fab fa-whatsapp"></i> Order All via WhatsApp
        </button>
      </div>
    </div>`;
}

// ---- CHECKOUT PAGE RENDERER ----
function renderCheckoutPage() {
  return `
    <div class="checkout-wrap">
      <h2 class="checkout-title">Checkout</h2>

      <!-- Steps -->
      <div class="steps">
        <div class="step-item">
          <div class="step-circle active" id="sc1">1</div>
          <div class="step-label active" id="sl1">Address</div>
        </div>
        <div class="step-line" id="sline1"></div>
        <div class="step-item">
          <div class="step-circle" id="sc2">2</div>
          <div class="step-label" id="sl2">Payment</div>
        </div>
        <div class="step-line" id="sline2"></div>
        <div class="step-item">
          <div class="step-circle" id="sc3">3</div>
          <div class="step-label" id="sl3">Confirm</div>
        </div>
      </div>

      <!-- Step 1: Address -->
      <div class="checkout-step active" id="co-step-1">
        <h3>Delivery Address</h3>
        <div class="form-grid">
          <div class="form-group"><label>Full Name *</label><input class="form-input" type="text" id="coName" placeholder="Your full name"/></div>
          <div class="form-group"><label>Phone *</label><input class="form-input" type="tel" id="coPhone" placeholder="+91 XXXXXXXXXX"/></div>
          <div class="form-group"><label>Email</label><input class="form-input" type="email" id="coEmail" placeholder="email@example.com"/></div>
          <div class="form-group"><label>Pincode *</label><input class="form-input" type="text" id="coPincode" placeholder="700001" maxlength="6"/></div>
          <div class="form-group"><label>City *</label><input class="form-input" type="text" id="coCity" placeholder="City"/></div>
          <div class="form-group"><label>State *</label><input class="form-input" type="text" id="coState" placeholder="West Bengal"/></div>
          <div class="form-group form-group--full"><label>Full Address *</label><input class="form-input" type="text" id="coAddress" placeholder="House no., Street, Area, Landmark..."/></div>
        </div>
        <div class="checkout-footer">
          <button class="btn btn--outline btn--md" onclick="Router.go('cart')">
            <i class="fas fa-arrow-left"></i> Back to Cart
          </button>
          <button class="btn btn--primary btn--lg" onclick="Checkout.proceedToPayment()">
            Continue to Payment <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Step 2: Payment -->
      <div class="checkout-step" id="co-step-2">
        <h3>Choose Payment Method</h3>
        <div class="payment-options">
          <div class="pay-option selected" onclick="Checkout.selectPayment(this,'upi')">
            <div class="pay-option__icon">📱</div><div class="pay-option__label">UPI</div>
          </div>
          <div class="pay-option" onclick="Checkout.selectPayment(this,'card')">
            <div class="pay-option__icon">💳</div><div class="pay-option__label">Card</div>
          </div>
          <div class="pay-option" onclick="Checkout.selectPayment(this,'netbanking')">
            <div class="pay-option__icon">🏦</div><div class="pay-option__label">Net Banking</div>
          </div>
          <div class="pay-option" onclick="Checkout.selectPayment(this,'cod')">
            <div class="pay-option__icon">💵</div><div class="pay-option__label">Cash on Delivery</div>
          </div>
        </div>
        <div id="paymentDetails">
          <div class="upi-qr">
            <p style="font-weight:600;margin-bottom:var(--space-1)">Scan & Pay via UPI</p>
            <p style="font-size:var(--text-xs);color:var(--color-muted)">UPI ID: ssgift@upi</p>
            <div class="qr-box"></div>
            <p style="font-size:var(--text-sm);color:var(--color-muted)">Or pay via PhonePe / GPay to <strong>+91 8967882790</strong></p>
          </div>
        </div>
        <div class="co-summary" id="coSummary"></div>
        <div class="checkout-footer">
          <button class="btn btn--outline btn--md" onclick="Checkout.goToStep(1)">
            <i class="fas fa-arrow-left"></i> Back
          </button>
          <button class="btn btn--primary btn--lg" onclick="Checkout.placeOrder()">
            <i class="fas fa-check"></i> Place Order
          </button>
        </div>
      </div>

      <!-- Step 3: Success -->
      <div class="checkout-step" id="co-step-3">
        <div class="order-success">
          <div class="order-success__icon">✅</div>
          <h2>Order Placed Successfully!</h2>
          <p style="color:var(--color-muted)">Thank you for shopping with SS GIFT 💕</p>
          <p style="color:var(--color-muted)">We'll WhatsApp you the order confirmation shortly.</p>
          <div class="order-id-badge" id="confirmedOrderId">Order #SSGIFT00000</div>
          <p style="color:var(--color-muted);font-size:var(--text-sm)">Expected Delivery: 3–5 Business Days</p>
          <div style="display:flex;gap:var(--space-4);justify-content:center;margin-top:var(--space-8);flex-wrap:wrap">
            <button class="btn btn--primary btn--lg" onclick="Router.go('account')">
              <i class="fas fa-box"></i> View My Orders
            </button>
            <button class="btn btn--outline btn--lg" onclick="Router.go('home')">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

// ---- WHATSAPP CART ORDER ----
function orderCartWhatsApp() {
  const cart = Store.getCart();
  if (!cart.length) { Toast.show('Cart is empty', 'error'); return; }
  const lines = [
    `🎁 Hi SS GIFT! I want to order:`, ``,
    ...cart.map(i => `• ${i.name} × ${i.qty} = ₹${i.price * i.qty}`),
    ``, `*Total: ₹${cart.reduce((s,c)=>s+c.price*c.qty,0)}*`,
    ``, `Please confirm and share delivery details!`,
  ];
  window.open(`https://wa.me/${CONFIG.WHATSAPP_NUM}?text=${encodeURIComponent(lines.join('\n'))}`);
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  UI.renderAuthArea();
  UI.updateBadges();
  UI.initScrollNav();
  UI.initSearchToggle();
  UI.initFadeObserver();

  // Initial route
  Router.go('home');

  // After route change, re-init admin if needed
  const origGo = Router.go.bind(Router);
  // Route to admin → init dashboard
  const _adminInit = new MutationObserver(() => {
    if (Router.current() === 'admin') {
      setTimeout(() => Admin.renderDashboard(), 50);
    }
    if (Router.current() === 'shop') {
      setTimeout(() => ShopPage.applyFilters(), 50);
    }
  });
  _adminInit.observe(document.getElementById('appRoot'), { childList: true });
});
