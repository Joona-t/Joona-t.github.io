// IH1 phone-case page: frame + relief plate in their assembled positions. The 3D viewer (three.js) is fetched only
// when the visitor presses "Open in 3D"; until then the page shows a render of the same files.
const $ = s => document.querySelector(s);

async function boot() {
  let ih;
  try {
    const r = await fetch('data/phone-cases.json'); if (!r.ok) throw new Error('HTTP ' + r.status);
    ih = (await r.json()).ih1;
  } catch (e) { $('#open-3d').disabled = true; $('#open-3d').textContent = 'Case data missing: ' + String(e.message || e); return; }
  const stage = $('#stage');
  let viewer = null, status = null, current = ih.designs[0];
  const FRAME = ih.default_colour, PLATE = ih.default_colour;

  async function ensureViewer() {
    if (viewer) return viewer;
    const mod = await import(`./viewer.js?v=${document.documentElement.dataset.v || '0'}`);
    status = mod.overlayStatus(stage);
    try { viewer = await mod.createViewer({ canvas: $('#scene'), onStatus: status.onStatus }); }
    catch (e) { status.fail('WebGL is not available in this browser. The renders on this page show the same files.', e); throw e; }
    document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => viewer.setView(b.dataset.view)));
    return viewer;
  }
  async function show(key) {
    const d = ih.designs.find(x => x.key === key); if (!d) return;
    current = d;
    document.querySelectorAll('[data-case]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.case === key)));
    $('#poster-img').src = d.render; $('#poster-img').alt = `${d.title} on our case, render of the real 3D files`;
    if (!viewer) return;
    try {
      await viewer.loadParts({ id: 'ih1-' + key, label: d.title, size_mm: ih.size_mm, colours: [FRAME, PLATE],
        parts: [{ url: ih.frame_mesh.gz, label: 'Frame' }, { url: d.plate_mesh.gz, label: `${d.title} plate` }] });
      viewer.setView('back');
    } catch (e) {
      if (e?.name === 'AbortError') return;
      status.fail('The model could not be loaded.', e);
    }
  }
  $('#open-3d').addEventListener('click', async () => {
    stage.classList.add('is-open'); $('#poster').hidden = true;
    try { await ensureViewer(); await show(current.key); } catch { /* reported in the overlay */ }
  });
  document.querySelectorAll('[data-case]').forEach(b => b.addEventListener('click', () => show(b.dataset.case)));
  const fromLink = ih.designs.find(x => location.hash === '#' + x.key);
  show((fromLink || ih.designs[0]).key);
}
boot();
