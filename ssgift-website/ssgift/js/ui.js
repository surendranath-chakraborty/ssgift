/**
 * SS GIFT — UI Utilities
 * Shared helpers: badges, nav auth area, global search, mobile menu, etc.
 */
const UI = (() => {

  /* ---- Product Card HTML ---- */
  const productCard = (p, extraClass = '') => {
    const wishlist = Store.getWishlist();
    const inWish   = wishlist.includes(p.id);
    const disc     = Math.round((1 - p.price / p.original) * 100);
    const stars    = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));

    return `
      <div class="product-card ${extraClass} fade-up" onclick="Router.go('product', {id:${p.id}})">
        <div class="product-card__img">
          ${disc > 0 ? `<span class="product-card__discount">-${disc}%</span>` : ''}
          <button class="product-card__wishlist ${inWish ? 'active' : ''}"
            onclick="event.stopPropagation(); Cart.toggleWishlist(${p.id}, this)"
            title="Wishlist">${inWish ? '❤️' : '🤍'}</button>
          <span style="font-size:4rem">${p.emoji}</span>
        </div>
        <div class="product-card__body">
          <div class="product-card__cat">${p.cat}</div>
          <div class="product-card__name">${p.name}</div>
          <div class="stars" style="margin-bottom:var(--space-2)">${stars}
            <span style="color:var(--color-muted);font-size:var(--text-xs);margin-left:4px">(${p.reviews})</span>
          </div>
          <div class="product-card__price-row">
            <span class="product-card__price">₹${p.price}</span>
            <span class="product-card__original">₹${p.original}</span>
          </div>
          <button class="product-card__add" onclick="event.stopPropagation(); Cart.addToCart(${p.id})">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      </div>`;
  };

  /* ---- Update Nav Badges ---- */
  const updateBadges = () => {
    const cartCount = Store.getCart().reduce((s, c) => s + c.qty, 0);
    const wishCount = Store.getWishlist().length;
    const cb = document.getElementById('cartBadge');
    const wb = document.getElementById('wishBadge');
    if (cb) cb.textContent = cartCount;
    if (wb) wb.textContent = wishCount;
  };

  /* ---- Render Auth Area ---- */
  const renderAuthArea = () => {
    const u    = Store.getCurrentUser();
    const area = document.getElementById('authArea');
    if (!area) return;

    if (u && u.isAdmin) {
      area.innerHTML = `<button class="btn-nav btn-nav-admin" onclick="Router.go('admin')">⚙️ Admin</button>`;
    } else if (u) {
      area.innerHTML = `<button class="btn-nav" onclick="Router.go('account')">${u.name.split(' ')[0]} <i class="fas fa-user" style="font-size:0.75em;margin-left:4px"></i></button>`;
    } else {
      area.innerHTML = `<button class="btn-nav" onclick="Router.go('auth')">Login / Register</button>`;
    }
  };

  /* ---- Mobile Menu ---- */
  const toggleMobile = () => {
    document.getElementById('mobileMenu').classList.toggle('open');
    document.getElementById('hamburger').classList.toggle('open');
  };

  /* ---- Global Search ---- */
  const globalSearch = (query) => {
    const box = document.getElementById('searchResults');
    if (!box) return;
    if (!query.trim()) { box.innerHTML = ''; return; }

    const results = Store.getProducts()
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) ||
                   p.cat.toLowerCase().includes(query.toLowerCase()) ||
                   p.tags.some(t => t.includes(query.toLowerCase())))
      .slice(0, 6);

    box.innerHTML = results.length
      ? results.map(p => `
          <div class="search-result-item" onclick="Router.go('product',{id:${p.id}});closeSearch()">
            <span class="search-result-emoji">${p.emoji}</span>
            <div>
              <div class="search-result-name">${p.name}</div>
              <div style="font-size:var(--text-xs);color:var(--color-muted)">${p.cat}</div>
            </div>
            <span class="search-result-price">₹${p.price}</span>
          </div>`).join('')
      : `<div style="padding:1rem;text-align:center;color:var(--color-muted);font-size:var(--text-sm)">No results found</div>`;
  };

  /* ---- Newsletter Subscribe ---- */
  const subscribeNewsletter = () => {
    const input = document.getElementById('newsletterEmail');
    const email = input?.value?.trim();
    if (!email || !email.includes('@')) { Toast.show('Enter a valid email address', 'error'); return; }
    const subs = Store.getSubscribers();
    if (subs.includes(email)) { Toast.show('You are already subscribed!', 'info'); return; }
    subs.push(email);
    Store.setSubscribers(subs);
    Toast.show('Subscribed! Welcome to the SS GIFT family 🎉', 'success');
    if (input) input.value = '';
  };

  /* ---- Scroll Navbar Shadow ---- */
  const initScrollNav = () => {
    window.addEventListener('scroll', () => {
      document.getElementById('mainNav')?.classList.toggle('scrolled', window.scrollY > 20);
    });
  };

  /* ---- Search Toggle ---- */
  const initSearchToggle = () => {
    document.getElementById('searchToggle')?.addEventListener('click', () => {
      document.getElementById('navSearchBox')?.classList.toggle('open');
      document.getElementById('globalSearch')?.focus();
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-search-wrap')) {
        document.getElementById('navSearchBox')?.classList.remove('open');
      }
    });
  };

  /* ---- IntersectionObserver for fade-up ---- */
  const initFadeObserver = () => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });

    const observe = () => {
      document.querySelectorAll('.fade-up:not(.visible)').forEach(el => obs.observe(el));
    };
    // Re-observe after route changes
    const mo = new MutationObserver(observe);
    mo.observe(document.getElementById('appRoot'), { childList: true, subtree: true });
    observe();
  };

  return {
    productCard, updateBadges, renderAuthArea,
    toggleMobile, globalSearch, subscribeNewsletter,
    initScrollNav, initSearchToggle, initFadeObserver,
  };
})();

// Global helper for closing search
function closeSearch() {
  document.getElementById('navSearchBox')?.classList.remove('open');
}
