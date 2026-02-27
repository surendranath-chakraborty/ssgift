/**
 * SS GIFT — Product Detail Page Renderer
 */
const ProductPage = (() => {
  let _qty = 1;
  let _productId = null;

  const render = (params = {}) => {
    const p = Store.getProductById(params.id);
    if (!p) return `<div class="empty-state"><div class="empty-state__icon">😔</div><h3 class="empty-state__title">Product not found</h3><button class="btn btn--primary btn--md" onclick="Router.go('shop')">Back to Shop</button></div>`;

    _productId = p.id;
    _qty = 1;

    const disc      = Math.round((1 - p.price / p.original) * 100);
    const stars     = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
    const wishlist  = Store.getWishlist();
    const inWish    = wishlist.includes(p.id);
    const related   = Store.getProducts().filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);

    return `
      <div class="page-header">
        <button class="back-btn" onclick="Router.go('shop')">
          <i class="fas fa-arrow-left"></i> Back to Shop
        </button>
        <div class="breadcrumb">Shop → ${p.cat} → <span>${p.name}</span></div>
      </div>

      <div class="product-detail">
        <div class="product-detail__grid">
          <!-- Image -->
          <div>
            <div class="product-detail__img">${p.emoji}</div>
          </div>

          <!-- Info -->
          <div>
            <div class="product-detail__cat">${p.cat}</div>
            <h1 class="product-detail__name">${p.name}</h1>
            <div class="product-detail__rating">
              <span class="stars">${stars}</span>
              <span>${p.rating} (${p.reviews} reviews)</span>
            </div>
            <div class="product-detail__price-row">
              <span class="product-detail__price">₹${p.price}</span>
              <span class="product-detail__original">₹${p.original}</span>
              ${disc > 0 ? `<span class="product-detail__disc">-${disc}% OFF</span>` : ''}
            </div>
            <p class="product-detail__desc">${p.desc}</p>

            <div class="qty-row">
              <label>Quantity:</label>
              <div class="qty-control">
                <button class="qty-control__btn" onclick="ProductPage.changeQty(-1)">−</button>
                <span class="qty-control__val" id="pdQty">1</span>
                <button class="qty-control__btn" onclick="ProductPage.changeQty(1)">+</button>
              </div>
              <span style="font-size:var(--text-sm);color:var(--color-muted)">${p.stock} in stock</span>
            </div>

            <div class="detail-btns">
              <button class="btn btn--primary btn--lg" onclick="ProductPage.addToCart()">
                <i class="fas fa-shopping-bag"></i> Add to Cart
              </button>
              <button class="btn btn--whatsapp btn--lg" onclick="ProductPage.orderWhatsApp()">
                <i class="fab fa-whatsapp"></i> Order on WhatsApp
              </button>
              <button class="btn btn--outline btn--md" id="pdWishBtn"
                onclick="Cart.toggleWishlist(${p.id}, this)">
                ${inWish ? '❤️ In Wishlist' : '♡ Wishlist'}
              </button>
            </div>

            <div class="delivery-info">
              <strong>🚚 Delivery:</strong> Free delivery on orders above ₹499. Same-day delivery available.<br>
              <strong>📦 Packaging:</strong> Premium gift wrapping included with every order.<br>
              <strong>💬 Support:</strong> Order on WhatsApp for fastest processing!
            </div>

            <!-- Tabs -->
            <div class="product-tabs">
              <div class="tab-nav">
                <button class="tab-nav-btn active" onclick="ProductPage.switchTab(this,'tab-desc')">Description</button>
                <button class="tab-nav-btn" onclick="ProductPage.switchTab(this,'tab-delivery')">Delivery Info</button>
                <button class="tab-nav-btn" onclick="ProductPage.switchTab(this,'tab-reviews')">Reviews (${p.reviews})</button>
              </div>
              <div class="tab-pane active" id="tab-desc">${p.desc}</div>
              <div class="tab-pane" id="tab-delivery">
                <strong>Delivery Information</strong><br><br>
                • Standard delivery: 3–5 business days<br>
                • Same-day delivery: Order before 2 PM (within city limits)<br>
                • Free shipping on orders above ₹499<br>
                • Secure packaging for all fragile and delicate items<br>
                • Real-time updates via WhatsApp
              </div>
              <div class="tab-pane" id="tab-reviews">
                ${[
                  { name:'Ananya S.', rating:5, text:'Absolutely loved it! Perfect gift, great quality and fast delivery.' },
                  { name:'Rohit M.', rating:4, text:'Great product, fast delivery! My partner was very happy.' },
                  { name:'Priyanka D.', rating:5, text:'My partner was over the moon. Highly recommended!' },
                ].map(r => `
                  <div style="border-bottom:1px solid var(--color-border);padding:var(--space-4) 0">
                    <div style="font-weight:600;margin-bottom:var(--space-1)">
                      ${r.name} <span class="stars">${'★'.repeat(r.rating)}</span>
                    </div>
                    <div style="font-size:var(--text-sm);color:var(--color-muted)">${r.text}</div>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        ${related.length ? `
          <div style="margin-top:var(--space-16)">
            <h3 style="font-family:var(--font-display);font-size:1.6rem;margin-bottom:var(--space-6)">
              You May Also <em style="color:var(--color-rose)">Love</em>
            </h3>
            <div class="products-grid products-grid--4">
              ${related.map(r => UI.productCard(r)).join('')}
            </div>
          </div>` : ''}
      </div>`;
  };

  const changeQty = (d) => {
    _qty = Math.max(1, _qty + d);
    const el = document.getElementById('pdQty');
    if (el) el.textContent = _qty;
  };

  const addToCart = () => {
    Cart.addToCart(_productId, _qty);
  };

  const orderWhatsApp = () => {
    const p = Store.getProductById(_productId);
    if (!p) return;
    const msg = [
      `🎁 Hi SS GIFT! I want to order:`,
      ``,
      `*${p.name}*`,
      `Quantity: ${_qty}`,
      `Price: ₹${p.price * _qty}`,
      ``,
      `Please confirm availability and delivery details.`,
    ].join('\n');
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`);
  };

  const switchTab = (btn, tabId) => {
    document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
  };

  return { render, changeQty, addToCart, orderWhatsApp, switchTab };
})();
