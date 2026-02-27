/**
 * SS GIFT — Wishlist Page Module
 */
const Wishlist = (() => {

  const render = () => {
    const ids      = Store.getWishlist();
    const products = Store.getProducts().filter(p => ids.includes(p.id));

    return `
      <div style="padding: var(--space-8) 5vw">
        <div class="page-header" style="padding:0;margin-bottom:var(--space-8)">
          <button class="back-btn" onclick="Router.go('shop')">
            <i class="fas fa-arrow-left"></i> Back to Shop
          </button>
          <h2 style="font-family:var(--font-display);font-size:var(--text-2xl)">My Wishlist ❤️</h2>
        </div>
        ${products.length
          ? `<div class="products-grid products-grid--4">
               ${products.map(p => UI.productCard(p)).join('')}
             </div>`
          : `<div class="empty-state">
               <div class="empty-state__icon">💔</div>
               <h3 class="empty-state__title">Your wishlist is empty</h3>
               <p class="empty-state__desc">Save items you love and find them here later</p>
               <button class="btn btn--primary btn--md" onclick="Router.go('shop')">
                 <i class="fas fa-store"></i> Explore Gifts
               </button>
             </div>`
        }
      </div>`;
  };

  return { render };
})();