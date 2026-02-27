/**
 * SS GIFT — Theme Manager
 * Dual-tone: light (warm cream) / dark (deep rose-black)
 */
const Theme = (() => {

  const DARK_ICON  = '☀️';
  const LIGHT_ICON = '🌙';

  const apply = (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('ssgift_theme', mode);

    const icon   = document.getElementById('themeIcon');
    const mIcon  = document.getElementById('mobileThemeIcon');
    const toggle = document.getElementById('themeToggle');

    if (mode === 'dark') {
      if (icon)   { icon.className = 'fas fa-sun'; }
      if (mIcon)  { mIcon.className = 'fas fa-sun'; }
      if (toggle) toggle.title = 'Switch to Light Mode';
    } else {
      if (icon)   { icon.className = 'fas fa-moon'; }
      if (mIcon)  { mIcon.className = 'fas fa-moon'; }
      if (toggle) toggle.title = 'Switch to Dark Mode';
    }
  };

  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    apply(current === 'light' ? 'dark' : 'light');
  };

  const init = () => {
    const saved = localStorage.getItem('ssgift_theme') || 'light';
    apply(saved);
  };

  return { apply, toggle, init };
})();
