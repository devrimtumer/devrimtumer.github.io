/* Progressive enhancement. All academic content and navigation work without JavaScript. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.getElementById('site-navigation');
  const setMenu = (open, restoreFocus = false) => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', open);
    if (restoreFocus) menuButton.focus();
  };
  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) setMenu(false);
    });
    window.matchMedia('(min-width: 821px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
  }

  const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
  const search = document.querySelector('[data-publication-search]');
  const filters = [...document.querySelectorAll('[data-publication-filter]')];
  const publications = [...document.querySelectorAll('[data-publication]')];
  let currentFilter = 'all';
  const applyFilter = () => {
    const query = normalize(search ? search.value.trim() : '');
    let count = 0;
    publications.forEach(publication => {
      const topicMatch = currentFilter === 'all' || publication.dataset.topic === currentFilter;
      const textMatch = normalize(publication.dataset.search || publication.textContent).includes(query);
      const matches = topicMatch && textMatch;
      publication.hidden = !matches;
      if (matches) count++;
    });
    const countNode = document.querySelector('[data-result-count]');
    const empty = document.querySelector('[data-empty-state]');
    if (countNode) countNode.textContent = `${count} of ${publications.length} publications`;
    if (empty) empty.hidden = count !== 0;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.publicationFilter === currentFilter)));
  };
  if (search) search.addEventListener('input', applyFilter);
  filters.forEach(button => button.addEventListener('click', () => {
    currentFilter = button.dataset.publicationFilter;
    applyFilter();
  }));
  document.querySelector('[data-reset-filters]')?.addEventListener('click', () => {
    currentFilter = 'all';
    if (search) search.value = '';
    applyFilter();
    if (search) search.focus();
  });

  let toastTimer;
  const announce = message => {
    const toast = document.querySelector('[data-toast]');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
  };
  const copyText = async text => {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* Native selection fallback below. */ }
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
    textarea.remove();
    return copied;
  };
  document.querySelectorAll('[data-copy-id]').forEach(button => button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copyId);
    if (!target) return;
    const success = await copyText(target.textContent.trim());
    button.focus();
    announce(success ? 'BibTeX copied to clipboard.' : 'Copy is unavailable here. Select and copy the citation below.');
  }));
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
})();
