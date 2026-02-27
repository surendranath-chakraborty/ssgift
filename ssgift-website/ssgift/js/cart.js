/**
 * SS GIFT — Cart & Wishlist Module
 */
const Cart = (() => {

  /* ---- ADD TO CART ---- */
  const addToCart = (productId, qty = 1) => {
    const product = Store.getProductById(productId);
    if (!product) return;

    const cart     = Store.getCart();
    const existing = cart.find(c => c.id === productId);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, cat: product.cat, qty });
    }

    Store.setCart(cart);
    Toast.show(`${product.name} added to cart 🛒`, 'success');
  };

  /* ---- REMOVE FROM CART ---- */
  const removeFromCart = (productId) => {
    const cart = Store.getCart().filter(c => c.id !== productId);
    Store.setCart(cart);
    Toast.show('Item removed from cart', 'info');
    // Re-render cart if on cart page
    if (Router.current() === 'cart') Router.go('cart');
  };

  /* ---- UPDATE QTY ---- */
  const updateQty = (productId, delta) => {
    const cart = Store.getCart();
    const item = cart.find(c => c.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId);
      return;
    }
    Store.setCart(cart);
    if (Router.current() === 'cart') Router.go('cart');
  };

  /* ---- CLEAR CART ---- */
  const clearCart = () => Store.setCart([]);

  /* ---- TOGGLE WISHLIST ---- */
  const toggleWishlist = (productId, btnEl) => {
    const wishlist = Store.getWishlist();
    const idx      = wishlist.indexOf(productId);

    if (idx >= 0) {
      wishlist.splice(idx, 1);
      if (btnEl) btnEl.textContent = '🤍';
      if (btnEl) btnEl.classList.remove('active');
      Toast.show('Removed from wishlist', 'info');
    } else {
      wishlist.push(productId);
      if (btnEl) btnEl.textContent = '❤️';
      if (btnEl) btnEl.classList.add('active');
      Toast.show('Added to wishlist ❤️', 'success');
    }

    Store.setWishlist(wishlist);

    // Update all heart buttons for same product
    document.querySelectorAll(`[data-wish-id="${productId}"]`).forEach(b => {
      b.textContent = wishlist.includes(productId) ? '❤️' : '🤍';
      b.classList.toggle('active', wishlist.includes(productId));
    });
  };

  /* ---- CALCULATE TOTALS ---- */
  const calcTotals = (couponCode = null) => {
    const cart     = Store.getCart();
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    let   discount = 0;

    if (couponCode) {
      const coup = Store.getCoupons().find(c => c.code === couponCode && c.active);
      if (coup) {
        discount = coup.type === 'percent'
          ? Math.round(subtotal * coup.value / 100)
          : coup.value;
      }
    }

    const delivery = subtotal >= CONFIG.FREE_DELIVERY_ABOVE ? 0 : CONFIG.DELIVERY_CHARGE;
    const total    = subtotal - discount + delivery;

    return { subtotal, discount, delivery, total };
  };

  return { addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, calcTotals };
})();