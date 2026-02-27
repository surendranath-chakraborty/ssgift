/**
 * SS GIFT — Toast Notifications
 */
const Toast = (() => {
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };

  const show = (message, type = 'info', duration = 3200) => {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(110%)';
      setTimeout(() => el.remove(), 320);
    }, duration);
  };

  return { show };
})();