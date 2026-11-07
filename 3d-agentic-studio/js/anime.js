// Zoro & Shenron plaques: six designs from data/anime-plaques.json, 3D only after "Open in 3D".
const $ = s => document.querySelector(s);

async function boot() {
  let data;
  try {
    const r = await fetch('data/anime-plaques.json'); if (!r.ok) throw new Error('HTTP ' + r.status);
    data = await r.json();
  } catch (e) { $('#open-3d').disabled = true; $('#open-3d').textContent = 'Plaque data missing: ' + String(e.message || e); return; }
  const stage = $('#stage');
  let viewer = null, status = null, current = data.items[0];

  async function ensureViewer() {
    if (viewer) return viewer;
    const mod = await import(`./viewer.js?v=${document.documentElement.dataset.v || '0'}`);
    status = mod.overlayStatus(stage);
    try { viewer = await mod.createViewer({ canvas: $('#scene'), onStatus: status.onStatus }); }
    catch (e) { status.fail('WebGL is not available in this browser. The stencils above show the designs.', e); throw e; }
    document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => viewer.setView(b.dataset.view)));
    return viewer;
  }
  async function show(id) {
    const it = data.items.find(x => x.id === id); if (!it) return;
    current = it;
    document.querySelectorAll('[data-design]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.design === id)));
    $('#poster-img').src = it.thumb; $('#poster-img').alt = `Engraving stencil for ${it.name}`;
    $('#download').href = it.download;
    if (!viewer) return;
    try {
      await viewer.loadParts({ id: it.id, label: it.name, size_mm: data.size_mm, colours: it.colours, parts: it.parts.map(p => ({ url: p.gz, label: p.label })) });
      viewer.setView('angled');
    } catch (e) {
      if (e?.name === 'AbortError') return;
      status.fail('The model could not be loaded.', e);
    }
  }
  $('#open-3d').addEventListener('click', async () => {
    stage.classList.add('is-open'); $('#poster').hidden = true;
    try { await ensureViewer(); await show(current.id); } catch { /* reported in the overlay */ }
  });
  document.querySelectorAll('[data-design]').forEach(b => b.addEventListener('click', () => show(b.dataset.design)));
  const fromLink = data.items.find(x => location.hash === '#' + x.id);
  show((fromLink || data.items[0]).id);
}
boot();
