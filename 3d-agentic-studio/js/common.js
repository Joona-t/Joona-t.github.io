// Shared on every page: copy buttons and the toast. No tracking, no network calls.
(() => {
  const toast = msg => {
    const t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.hidden = true; }, 2200);
  };
  window.studioToast = toast;
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const pre = document.getElementById(b.dataset.copy); if (!pre) return;
    const text = pre.textContent.trim();
    try { await navigator.clipboard.writeText(text); toast('Prompt copied'); return; } catch { /* fall through */ }
    const range = document.createRange(); range.selectNodeContents(pre);
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    toast(ok ? 'Prompt copied' : 'Text selected: press Ctrl+C or Cmd+C to copy');
  }));
})();
