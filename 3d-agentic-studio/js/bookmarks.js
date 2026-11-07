// Bookmark page: the two colour parts extracted from the published MakerWorld 3MFs (data/bookmarks.json).
// The 3D viewer loads only after "Open in 3D"; the photos above it are the real prints.
const $ = s => document.querySelector(s);

async function boot() {
  let data;
  try {
    const r = await fetch('data/bookmarks.json'); if (!r.ok) throw new Error('HTTP ' + r.status);
    data = await r.json();
  } catch (e) { $('#open-3d').disabled = true; $('#open-3d').textContent = 'Bookmark data missing: ' + String(e.message || e); return; }
  const stage = $('#stage');
  let viewer = null, status = null, current = data.items[0];

  async function ensureViewer() {
    if (viewer) return viewer;
    const mod = await import(`./viewer.js?v=${document.documentElement.dataset.v || '0'}`);
    status = mod.overlayStatus(stage);
    try { viewer = await mod.createViewer({ canvas: $('#scene'), onStatus: status.onStatus }); }
    catch (e) { status.fail('WebGL is not available in this browser. The photos above show the real prints.', e); throw e; }
    document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => viewer.setView(b.dataset.view)));
    return viewer;
  }
  async function show(id) {
    const it = data.items.find(x => x.id === id); if (!it) return;
    current = it;
    document.querySelectorAll('[data-bm]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.bm === id)));
    if (!viewer) return;
    const [base, top] = it.parts;
    try {
      await viewer.loadParts({ id: it.id, label: it.name, size_mm: data.size_mm, colours: [base.colour, top.colour],
        parts: [{ url: base.gz, label: `${it.name} base` }, { url: top.gz, label: `${it.name} artwork` }] });
      viewer.setView('front');
    } catch (e) {
      if (e?.name === 'AbortError') return;
      status.fail('The model could not be loaded.', e);
    }
  }
  $('#open-3d').addEventListener('click', async () => {
    stage.classList.add('is-open'); $('#poster').hidden = true;
    try { await ensureViewer(); await show(current.id); } catch { /* reported in the overlay */ }
  });
  document.querySelectorAll('[data-bm]').forEach(b => b.addEventListener('click', () => show(b.dataset.bm)));
  const fromLink = data.items.find(x => location.hash === '#' + x.id);
  show((fromLink || data.items[0]).id);
}
boot();
