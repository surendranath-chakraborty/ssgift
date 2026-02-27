/**
 * SS GIFT — UI Utilities
 */
const UI = (() => {

  /* ── Product Card ─────────────────────────── */
  const productCard = (p) => {
    const wishlist = Store.getWishlist();
    const inWish   = wishlist.includes(p.id);
    const disc     = Math.round((1 - p.price / p.original) * 100);
    const stars    = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));

    return `
      <div class="product-card fade-up" onclick="Router.go('product',{id:${p.id}})">
        <div class="product-card__img">
          ${disc > 0 ? `<span class="product-card__discount">-${disc}%</span>` : ''}
          <button class="product-card__wishlist ${inWish ? 'active' : ''}"
            onclick="event.stopPropagation();Cart.toggleWishlist(${p.id},this)"
            title="${inWish?'Remove from wishlist':'Add to wishlist'}">${inWish ? '❤️' : '🤍'}</button>
          ${p.image
            ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0"/>`
            : `<span style="font-size:4rem">${p.emoji}</span>`}
        </div>
        <div class="product-card__body">
          <div class="product-card__cat">${p.cat}</div>
          <div class="product-card__name">${p.name}</div>
          <div class="stars" style="margin-bottom:var(--s2)">${stars}
            <span style="color:var(--color-muted);font-size:var(--text-xs);margin-left:4px">(${p.reviews})</span>
          </div>
          <div class="product-card__price-row">
            <span class="product-card__price">₹${p.price}</span>
            <span class="product-card__original">₹${p.original}</span>
          </div>
          <button class="product-card__add" onclick="event.stopPropagation();Cart.addToCart(${p.id})">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      </div>`;
  };

  /* ── Nav Badges ───────────────────────────── */
  const updateBadges = () => {
    const cc = Store.getCart().reduce((s,c) => s + c.qty, 0);
    const wc = Store.getWishlist().length;
    const cb = document.getElementById('cartBadge');
    const wb = document.getElementById('wishBadge');
    if (cb) cb.textContent = cc;
    if (wb) wb.textContent = wc;
  };

  /* ── Nav Auth Area ────────────────────────── */
  const renderAuthArea = () => {
    const u    = Store.getCurrentUser();
    const area = document.getElementById('authArea');
    if (!area) return;

    if (u && u.isAdmin) {
      area.innerHTML = `
        <button class="btn-nav" style="background:var(--color-text);color:var(--color-bg);gap:.4rem"
          onclick="Router.go('admin')">
          <i class="fas fa-cog"></i> Admin
        </button>`;
    } else if (u) {
      // Show Google avatar if available, else initial
      const avatarHTML = u.photo
        ? `<img src="${u.photo}" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.6);"
             onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
        : '';
      const initialHTML = `<span style="${u.photo ? 'display:none;' : ''}width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;">${(u.name||'U')[0].toUpperCase()}</span>`;

      area.innerHTML = `
        <button class="btn-nav" onclick="Router.go('account')"
          style="display:flex;align-items:center;gap:var(--s2);padding:.35rem .9rem .35rem .35rem;">
          ${avatarHTML}${initialHTML}
          <span style="max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name.split(' ')[0]}</span>
        </button>`;
    } else {
      area.innerHTML = `
        <button class="btn-nav-outline" onclick="Router.go('auth')" style="margin-right:var(--s1)">Sign In</button>
        <button class="btn-nav" onclick="Router.go('auth')">Join Free</button>`;
    }
  };

  /* ── Category Dropdown ────────────────────── */
  const renderCatDropdown = () => {
    const el = document.getElementById('catDropdown');
    if (!el) return;
    el.innerHTML = CATEGORIES.map(c => `
      <a href="#" onclick="Router.go('shop',{cat:'${c.name}'})">
        <span>${c.emoji}</span> ${c.name}
      </a>`).join('');
  };

  /* ── Mobile Menu Toggle ───────────────────── */
  const toggleMobile = () => {
    document.getElementById('mobileMenu')?.classList.toggle('open');
    document.getElementById('hamburger')?.classList.toggle('open');
  };

  /* ── Global Search ────────────────────────── */
  const globalSearch = (query) => {
    const box = document.getElementById('searchResults');
    if (!box) return;
    if (!query.trim()) { box.innerHTML = ''; return; }

    const results = Store.getProducts()
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) ||
                   p.cat.toLowerCase().includes(query.toLowerCase()) ||
                   (p.tags||[]).some(t => t.includes(query.toLowerCase())))
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

  /* ── Newsletter ───────────────────────────── */
  const subscribeNewsletter = () => {
    const input = document.getElementById('newsletterEmail');
    const email = input?.value?.trim();
    if (!email || !email.includes('@')) { Toast.show('Enter a valid email address', 'error'); return; }
    const subs = Store.getSubscribers();
    if (subs.includes(email)) { Toast.show('Already subscribed!', 'info'); return; }
    subs.push(email);
    Store.setSubscribers(subs);
    Toast.show('Subscribed! Welcome to SS GIFT 🎉', 'success');
    if (input) input.value = '';
  };

  /* ── Scroll Nav Shadow ────────────────────── */
  const initScrollNav = () => {
    window.addEventListener('scroll', () => {
      document.getElementById('mainNav')?.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  };

  /* ── Search Toggle ────────────────────────── */
  const initSearchToggle = () => {
    document.getElementById('searchToggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('navSearchBox')?.classList.toggle('open');
      document.getElementById('globalSearch')?.focus();
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-search-wrap')) {
        document.getElementById('navSearchBox')?.classList.remove('open');
      }
    });
  };

  /* ── Fade-up Observer ─────────────────────── */
  const initFadeObserver = () => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });

    const observe = () => {
      document.querySelectorAll('.fade-up:not(.visible)').forEach(el => obs.observe(el));
    };
    new MutationObserver(observe)
      .observe(document.getElementById('appRoot'), { childList: true, subtree: true });
    observe();
  };

  return {
    productCard, updateBadges, renderAuthArea, renderCatDropdown,
    toggleMobile, globalSearch, subscribeNewsletter,
    initScrollNav, initSearchToggle, initFadeObserver,
  };
})();

// Global helper — closes search box
function closeSearch() {
  document.getElementById('navSearchBox')?.classList.remove('open');
}