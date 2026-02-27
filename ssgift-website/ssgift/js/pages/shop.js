/**
 * SS GIFT — Shop Page Renderer
 */
const ShopPage = (() => {
  let _page    = 1;
  let _filters = { cats: [], search: '', maxPrice: 5000, inStock: false, sort: 'default' };

  const render = (params = {}) => {
    if (params.cat) _filters.cats = [params.cat];
    else _filters = { cats: [], search: '', maxPrice: 5000, inStock: false, sort: 'default' };
    _page = 1;

    const allCats = [...new Set(Store.getProducts().map(p => p.cat))];

    return `
      <div class="shop-layout">
        <!-- SIDEBAR -->
        <aside class="shop-sidebar">
          <div class="filter-card">
            <div class="filter-card__title">Categories <i class="fas fa-chevron-down"></i></div>
            <div class="filter-card__options" id="catFilters">
              ${allCats.map(c => `
                <label>
                  <input type="checkbox" value="${c}" onchange="ShopPage.applyFilters()"
                    ${_filters.cats.includes(c) ? 'checked' : ''}/>
                  ${c}
                </label>`).join('')}
            </div>
          </div>
          <div class="filter-card">
            <div class="filter-card__title">Price Range <i class="fas fa-chevron-down"></i></div>
            <div class="price-range-labels"><span>₹0</span><span id="priceLabel">₹5000</span></div>
            <input type="range" class="price-range" min="0" max="5000" value="5000" id="priceRange"
              oninput="ShopPage.updatePrice(this.value)"/>
          </div>
          <div class="filter-card">
            <div class="filter-card__title">Availability</div>
            <div class="filter-card__options">
              <label><input type="checkbox" id="inStockFilter" onchange="ShopPage.applyFilters()"/> In Stock Only</label>
            </div>
          </div>
          <button class="btn btn--outline btn--md btn--full" onclick="ShopPage.clearFilters()">
            <i class="fas fa-times"></i> Clear All Filters
          </button>
        </aside>

        <!-- MAIN -->
        <main>
          <div class="shop-header">
            <div>
              <h2 class="shop-header__title">All Gifts</h2>
              <p class="shop-header__count" id="productCount">Loading...</p>
            </div>
            <div class="shop-controls">
              <div class="search-bar">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search gifts..." id="shopSearch" oninput="ShopPage.applyFilters()"/>
              </div>
              <select class="sort-select" id="sortSelect" onchange="ShopPage.applyFilters()">
                <option value="default">Sort: Default</option>
                <option value="priceLow">Price: Low → High</option>
                <option value="priceHigh">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
          <div class="filter-chips" id="filterChips"></div>
          <div class="products-grid" id="shopGrid"></div>
          <div class="pagination" id="shopPagination"></div>
        </main>
      </div>`;
  };

  const applyFilters = () => {
    const search   = document.getElementById('shopSearch')?.value?.toLowerCase() || '';
    const sort     = document.getElementById('sortSelect')?.value || 'default';
    const maxPrice = parseInt(document.getElementById('priceRange')?.value || 5000);
    const inStock  = document.getElementById('inStockFilter')?.checked || false;
    const cats     = Array.from(document.querySelectorAll('#catFilters input:checked')).map(i => i.value);

    let products = Store.getProducts();
    if (cats.length)  products = products.filter(p => cats.includes(p.cat));
    if (search)       products = products.filter(p => p.name.toLowerCase().includes(search) || p.tags.some(t => t.includes(search)));
    products = products.filter(p => p.price <= maxPrice);
    if (inStock)      products = products.filter(p => p.stock > 0);
    if (sort === 'priceLow')  products.sort((a, b) => a.price - b.price);
    if (sort === 'priceHigh') products.sort((a, b) => b.price - a.price);
    if (sort === 'rating')    products.sort((a, b) => b.rating - a.rating);

    const PERPAGE = CONFIG.PRODUCTS_PER_PAGE;
    const total   = Math.ceil(products.length / PERPAGE);
    if (_page > total) _page = 1;
    const sliced  = products.slice((_page - 1) * PERPAGE, _page * PERPAGE);

    const countEl = document.getElementById('productCount');
    if (countEl) countEl.textContent = `${products.length} products found`;

    const grid = document.getElementById('shopGrid');
    if (grid) {
      grid.innerHTML = sliced.length
        ? sliced.map(p => UI.productCard(p)).join('')
        : `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--color-muted)">
             <div style="font-size:3rem;margin-bottom:1rem">😔</div>
             No products found matching your filters.
           </div>`;
    }

    renderPagination(total);
    renderChips(cats, search, maxPrice, inStock);
  };

  const renderPagination = (total) => {
    const el = document.getElementById('shopPagination');
    if (!el || total <= 1) { if (el) el.innerHTML = ''; return; }
    el.innerHTML = Array.from({ length: total }, (_, i) =>
      `<button class="page-btn ${i + 1 === _page ? 'active' : ''}" onclick="ShopPage.goPage(${i + 1})">${i + 1}</button>`
    ).join('');
  };

  const renderChips = (cats, search, maxPrice, inStock) => {
    const el = document.getElementById('filterChips');
    if (!el) return;
    const chips = [];
    cats.forEach(c => chips.push(`<span class="chip" onclick="ShopPage.removeFilter('cat','${c}')">${c} ✕</span>`));
    if (search) chips.push(`<span class="chip" onclick="ShopPage.removeFilter('search')">Search: "${search}" ✕</span>`);
    if (maxPrice < 5000) chips.push(`<span class="chip" onclick="ShopPage.removeFilter('price')">Under ₹${maxPrice} ✕</span>`);
    if (inStock) chips.push(`<span class="chip" onclick="ShopPage.removeFilter('inStock')">In Stock ✕</span>`);
    el.innerHTML = chips.join('');
  };

  const updatePrice = (v) => {
    const el = document.getElementById('priceLabel');
    if (el) el.textContent = `₹${v}`;
    applyFilters();
  };

  const goPage = (p) => { _page = p; applyFilters(); window.scrollTo({ top: 68, behavior: 'smooth' }); };

  const clearFilters = () => {
    _page = 1;
    document.querySelectorAll('#catFilters input').forEach(i => i.checked = false);
    const si = document.getElementById('shopSearch'); if (si) si.value = '';
    const ss = document.getElementById('sortSelect'); if (ss) ss.value = 'default';
    const pr = document.getElementById('priceRange'); if (pr) pr.value = 5000;
    const pl = document.getElementById('priceLabel'); if (pl) pl.textContent = '₹5000';
    const is = document.getElementById('inStockFilter'); if (is) is.checked = false;
    applyFilters();
    Toast.show('Filters cleared', 'info');
  };

  const removeFilter = (type, val) => {
    if (type === 'cat') {
      const input = document.querySelector(`#catFilters input[value="${val}"]`);
      if (input) input.checked = false;
    }
    if (type === 'search') { const si = document.getElementById('shopSearch'); if (si) si.value = ''; }
    if (type === 'price')  { const pr = document.getElementById('priceRange'); if (pr) pr.value = 5000; const pl = document.getElementById('priceLabel'); if (pl) pl.textContent = '₹5000'; }
    if (type === 'inStock'){ const is = document.getElementById('inStockFilter'); if (is) is.checked = false; }
    applyFilters();
  };

  return { render, applyFilters, updatePrice, goPage, clearFilters, removeFilter };
})();
