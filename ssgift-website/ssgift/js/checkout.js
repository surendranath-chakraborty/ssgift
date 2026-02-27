/**
 * SS GIFT — Checkout Module
 */
const Checkout = (() => {
  let _step            = 1;
  let _paymentMethod   = 'upi';
  let _appliedCoupon   = null;

  /* ---- Step Navigation ---- */
  const goToStep = (n) => {
    _step = n;
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`co-step-${n}`)?.classList.add('active');

    // Update step indicator
    for (let i = 1; i <= 3; i++) {
      document.getElementById(`sc${i}`)?.classList.toggle('active', i === n);
      document.getElementById(`sc${i}`)?.classList.toggle('done',   i < n);
      document.getElementById(`sl${i}`)?.classList.toggle('active', i === n);
      if (i < 3) document.getElementById(`sline${i}`)?.classList.toggle('done', i < n);
    }
  };

  /* ---- Step 1 → Step 2 ---- */
  const proceedToPayment = () => {
    const fields = ['coName','coPhone','coPincode','coCity','coState','coAddress'];
    const empty  = fields.filter(id => !document.getElementById(id)?.value?.trim());
    if (empty.length) { Toast.show('Please fill all required fields', 'error'); return; }
    goToStep(2);
    renderSummary();
  };

  /* ---- Render Summary in Payment Step ---- */
  const renderSummary = () => {
    const cart = Store.getCart();
    const { subtotal, discount, delivery, total } = Cart.calcTotals(_appliedCoupon);
    const el = document.getElementById('coSummary');
    if (!el) return;
    el.innerHTML = `
      ${cart.map(c => `<div class="summary-row"><span>${c.name} × ${c.qty}</span><span>₹${c.price * c.qty}</span></div>`).join('')}
      <div class="summary-row" style="border-top:1px solid var(--color-border);padding-top:var(--space-2);margin-top:var(--space-2)">
        <span>Delivery</span><span>${delivery === 0 ? 'FREE' : '₹'+delivery}</span>
      </div>
      <div class="summary-row" style="font-weight:700;color:var(--color-rose);font-size:var(--text-lg)">
        <span>Total</span><span>₹${total}</span>
      </div>`;
  };

  /* ---- Select Payment Method ---- */
  const selectPayment = (el, method) => {
    _paymentMethod = method;
    document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');

    const pd = document.getElementById('paymentDetails');
    const paymentForms = {
      upi: `<div class="upi-qr">
              <p style="font-weight:600;margin-bottom:var(--space-1)">Scan & Pay via UPI</p>
              <p style="font-size:var(--text-xs);color:var(--color-muted)">UPI ID: ssgift@upi</p>
              <div class="qr-box"></div>
              <p style="font-size:var(--text-sm);color:var(--color-muted)">Or pay via PhonePe / GPay / Paytm to <strong>+91 8967882790</strong></p>
            </div>`,
      card: `<div style="display:flex;flex-direction:column;gap:var(--space-3);margin-top:var(--space-4)">
               <input class="form-input" type="text" placeholder="Card Number (16 digits)" maxlength="16"/>
               <div style="display:flex;gap:var(--space-3)">
                 <input class="form-input" type="text" placeholder="MM / YY" style="flex:1"/>
                 <input class="form-input" type="text" placeholder="CVV" style="flex:1" maxlength="3"/>
               </div>
               <input class="form-input" type="text" placeholder="Cardholder Name"/>
             </div>`,
      netbanking: `<select class="form-input" style="margin-top:var(--space-4)">
                     <option value="">Select Your Bank</option>
                     <option>State Bank of India</option>
                     <option>HDFC Bank</option>
                     <option>ICICI Bank</option>
                     <option>Axis Bank</option>
                     <option>Punjab National Bank</option>
                     <option>Bank of Baroda</option>
                   </select>`,
      cod: `<div style="background:var(--color-blush);border-radius:var(--radius-md);padding:var(--space-5);margin-top:var(--space-4)">
              <p style="font-size:var(--text-sm);color:var(--color-muted)">
                ✅ <strong>Cash on Delivery selected.</strong><br>
                Please keep exact change ready at the time of delivery.
                Our delivery partner will collect the amount.
              </p>
            </div>`,
    };

    if (pd) pd.innerHTML = paymentForms[method] || '';
  };

  /* ---- Place Order ---- */
  const placeOrder = () => {
    const cart = Store.getCart();
    if (!cart.length) { Toast.show('Your cart is empty', 'error'); return; }

    const { total } = Cart.calcTotals(_appliedCoupon);
    const orderId   = 'SSGIFT' + Math.floor(Math.random() * 90000 + 10000);
    const u         = Store.getCurrentUser();

    const order = {
      id:       orderId,
      userId:   u ? u.id : 'guest',
      customer: document.getElementById('coName')?.value || 'Guest',
      phone:    document.getElementById('coPhone')?.value || '',
      email:    document.getElementById('coEmail')?.value || '',
      address:  [
        document.getElementById('coAddress')?.value,
        document.getElementById('coCity')?.value,
        document.getElementById('coState')?.value,
        document.getElementById('coPincode')?.value,
      ].filter(Boolean).join(', '),
      items:    [...cart],
      total,
      payment:  _paymentMethod,
      coupon:   _appliedCoupon,
      status:   'Processing',
      date:     new Date().toLocaleDateString('en-IN'),
    };

    const orders = Store.getOrders();
    orders.unshift(order);
    Store.setOrders(orders);
    Cart.clearCart();

    // Update confirm screen
    document.getElementById('confirmedOrderId').textContent = `Order #${orderId}`;
    goToStep(3);
    Toast.show('Order placed successfully! 🎉', 'success');

    // WhatsApp notification
    const msg = [
      `🎁 *New Order #${orderId}*`,
      `👤 Customer: ${order.customer}`,
      `📞 Phone: ${order.phone}`,
      ``,
      `📦 Items:`,
      ...order.items.map(i => `  • ${i.name} × ${i.qty} = ₹${i.price * i.qty}`),
      ``,
      `💰 Total: ₹${order.total}`,
      `💳 Payment: ${order.payment.toUpperCase()}`,
      `📍 Address: ${order.address}`,
    ].join('\n');

    setTimeout(() => {
      if (confirm('Order confirmed! ✅\n\nClick OK to send order details to SS GIFT on WhatsApp for faster processing.')) {
        window.open(`https://wa.me/${CONFIG.WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`);
      }
    }, 600);
  };

  /* ---- Apply Coupon ---- */
  const applyCoupon = () => {
    const code   = document.getElementById('couponInput')?.value?.trim()?.toUpperCase();
    const coupons = Store.getCoupons();
    const coup    = coupons.find(c => c.code === code && c.active);
    const msgEl   = document.getElementById('couponMsg');

    if (coup) {
      _appliedCoupon = code;
      if (msgEl) { msgEl.style.color = 'var(--color-success)'; msgEl.textContent = `✅ ${coup.type === 'percent' ? coup.value + '% off' : '₹' + coup.value + ' off'} applied!`; }
      Toast.show(`Coupon ${code} applied! 🎉`, 'success');
      updateCartSummary();
    } else {
      _appliedCoupon = null;
      if (msgEl) { msgEl.style.color = 'var(--color-error)'; msgEl.textContent = '❌ Invalid or expired coupon'; }
      updateCartSummary();
    }
  };

  /* ---- Update Cart Summary ---- */
  const updateCartSummary = () => {
    const { subtotal, discount, delivery, total } = Cart.calcTotals(_appliedCoupon);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('summarySubtotal', `₹${subtotal}`);
    set('summaryDisc',     `-₹${discount}`);
    set('summaryDel',      delivery === 0 ? 'FREE 🎉' : `₹${delivery}`);
    set('summaryTotal',    `₹${total}`);
  };

  const resetCoupon = () => { _appliedCoupon = null; };

  return { goToStep, proceedToPayment, selectPayment, placeOrder, applyCoupon, updateCartSummary, resetCoupon };
})();
