/**
 * SS GIFT — Modal Manager
 */
const Modal = (() => {
  const open = (title, bodyHTML) => {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalOverlay').classList.add('open');
  };

  const close = () => {
    document.getElementById('modalOverlay').classList.remove('open');
  };

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') close();
  });

  return { open, close };
})();
