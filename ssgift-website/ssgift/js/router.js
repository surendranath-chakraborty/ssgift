/**
 * SS GIFT — Client-Side Router
 * Hash-based SPA navigation.
 */
const Router = (() => {
  const routes = {};
  let _currentRoute = null;

  const register = (name, renderFn) => { routes[name] = renderFn; };

  const go = (name, params = {}) => {
    if (!routes[name]) { console.warn(`Route "${name}" not registered`); return; }
    _currentRoute = name;

    // Auth guard
    if (name === 'account' && !Store.getCurrentUser()) { go('auth'); return; }
    if (name === 'admin') {
      const u = Store.getCurrentUser();
      if (!u || !u.isAdmin) { Toast.show('Admin access required', 'error'); go('auth'); return; }
    }

    const root = document.getElementById('appRoot');
    root.innerHTML = routes[name](params);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Close mobile menu
    document.getElementById('mobileMenu')?.classList.remove('open');
    document.getElementById('hamburger')?.classList.remove('open');

    // Init fade-up animations
    requestAnimationFrame(() => {
      document.querySelectorAll('.fade-up').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 60);
      });
    });
  };

  const current = () => _currentRoute;

  return { register, go, current };
})();