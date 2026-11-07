// Shelf plaques page: gallery, routing, 3D stage, downloads. Data comes only from data/catalog.json.
// The 3D viewer (js/viewer.js + three.js) is imported only when the visitor opens a design in 3D.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mb = b => b == null ? '—' : b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.round(b / 1e3) + ' KB';
const fmtDate = iso => iso ? iso.replace('T', ' ').slice(0, 16) : '';

let catalog, viewer = null, status = null, versions = [], currentVersion = null, colorway = 'yellow_red';

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.hidden = true; }, 2200);
}

async function boot() {
  try {
    const res = await fetch('data/catalog.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    catalog = await res.json();
  } catch (err) {
    $('#grid').innerHTML = `<div class="notice bad">Could not load <code>data/catalog.json</code> (${esc(err.message)}). Run <code>python3 scripts/build_catalog.py</code> and reload.</div>`;
    return;
  }
  versions = catalog.designs.flatMap(d => d.versions.map(v => ({ ...v, design: d })));
  renderHero();
  renderGallery();
  renderDownloads();
  setupStudio();
  setupCompare();
  setupNav();
  if ($('#footer-generated')) $('#footer-generated').textContent = `Catalog generated ${fmtDate(catalog.summary.generated)} from the project files.`;
  const stand = catalog.extras.stand;
  $('#construct-stand').innerHTML = stand.exists
    ? `<strong>Stand file:</strong> <a href="${esc(stand.path)}" download>Shelf_stand_4mm_slot.stl</a> (${mb(stand.bytes)}, 28 triangles). ${esc(stand.note)}`
    : `<strong>Stand file missing:</strong> ${esc(stand.path)} was not found.`;
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const pre = document.getElementById(b.dataset.copy);
    const text = pre.textContent.trim();
    try { await navigator.clipboard.writeText(text); toast('Prompt copied'); return; } catch { /* fall through */ }
    // Clipboard API blocked: select the text so a plain Cmd/Ctrl+C works, and try the legacy command.
    const range = document.createRange(); range.selectNodeContents(pre);
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    toast(ok ? 'Prompt copied' : 'Text selected: press Ctrl+C or Cmd+C to copy');
  }));
  window.addEventListener('hashchange', route);
  route(true);
}

function renderHero() {
  const s = catalog.summary;
  $('#hero-stats').innerHTML = [
    [s.designs, 'concepts'],
    [`${s.sliced_ok}/${s.designs}`, 'slice clean'],
    [`${s.hours_range[0]}–${s.hours_range[1]} h`, 'per plaque, estimated'],
    [`${Math.round(s.grams_range[0])}–${Math.round(s.grams_range[1])} g`, 'PLA, estimated'],
    [String(s.printed_ok ?? 0), 'printed OK so far'],
  ].map(([b, l]) => `<div class="stat"><b>${esc(b)}</b><span>${esc(l)}</span></div>`).join('');
}

function cardTags(d) {
  const t = [];
  if (d.characters.includes('Lelouch')) t.push('<span class="tag tag-lav">+ Lelouch</span>');
  if (d.versions.some(v => v.files.some(f => f.colorway === 'orange_yellow' && f.exists))) t.push('<span class="tag tag-orange">orange/yellow file</span>');
  if (d.versions.length > 1) t.push('<span class="tag tag-pink">signed 195 mm version</span>');
  const sl = d.versions[0].slice.yellow_red;
  if (sl && sl.ok) t.push('<span class="tag tag-mint">slice clean</span>');
  return t.join('');
}

function renderGallery() {
  const grid = $('#grid');
  grid.innerHTML = catalog.designs.map(d => `
    <article class="card" role="listitem" data-id="${d.id}">
      <span class="num" aria-hidden="true">${d.number}</span>
      <div class="pic">
        <img class="source" src="${esc(d.source.thumb)}" alt="Engraving source for concept ${d.number}: black-and-white stencil of ${esc(d.characters.join(' and '))}." loading="lazy" width="640" height="640">
        <img class="concept" src="${esc(d.concept.crop)}" alt="" loading="lazy" width="640" height="640" aria-hidden="true">
        <span class="which" aria-hidden="true">source</span>
      </div>
      <div class="body">
        <h3 style="margin:0;font-size:1.1rem">Concept ${d.number}</h3>
        <div class="tags">${cardTags(d)}</div>
        <div class="actions">
          <button class="btn btn-sm btn-ghost flip" type="button" aria-pressed="false" aria-label="Flip to the concept render">Flip ⇄</button>
          <a class="btn btn-sm btn-primary" href="#studio/${d.versions[0].id}">Open in 3D</a>
        </div>
      </div>
    </article>`).join('');
  grid.addEventListener('click', e => {
    const b = e.target.closest('.flip'); if (!b) return;
    const card = b.closest('.card');
    const on = card.classList.toggle('show-concept');
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'Flip to the engraving source' : 'Flip to the concept render');
    $('.which', card).textContent = on ? 'concept' : 'source';
  });
  $('#flip-all').addEventListener('click', e => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(on));
    e.currentTarget.textContent = on ? 'Show all engraving sources' : 'Show all concept renders';
    $$('.card', grid).forEach(card => {
      card.classList.toggle('show-concept', on);
      const b = $('.flip', card); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Flip to the engraving source' : 'Flip to the concept render');
      $('.which', card).textContent = on ? 'concept' : 'source';
    });
  });
}

function applyColorway() {
  const c = catalog.colorways.find(x => x.id === colorway);
  const v = currentVersion;
  let availability;
  if (!v) availability = '';
  else if (c.id === 'yellow_red') availability = v.signed ? 'The signed file stores its own filament colours (shown in the download card); the geometry is the same as this preview.' : 'A yellow/red 3MF with these project colours exists for this design.';
  else if (c.id === 'orange_yellow') availability = v.files.some(f => f.colorway === 'orange_yellow' && f.exists) ? 'An orange/yellow 3MF exists for this concept (placeholder PLA Matte profiles).' : 'No orange/yellow file exists for this version. This is a visual preview only.';
  else availability = 'Visual preview only: no file ships in pink/red.';
  $('#colorway-note').innerHTML = `<strong>${esc(c.label)}:</strong> ${esc(c.note)} ${esc(availability)}`;
}

function colourHexes() {
  const c = catalog.colorways.find(x => x.id === colorway) || catalog.colorways[0];
  return [c.body, c.floor, '#FF8B16'];
}

function renderColorways() {
  const box = $('#colorways');
  box.innerHTML = catalog.colorways.map(c => `<button type="button" aria-pressed="${c.id === colorway}" data-colorway="${esc(c.id)}"><span class="swatch" style="--a:${esc(c.body)};--b:${esc(c.floor)}" aria-hidden="true"></span>${esc(c.label)}</button>`).join('');
  $$('[data-colorway]', box).forEach(b => b.addEventListener('click', () => {
    colorway = b.dataset.colorway;
    $$('[data-colorway]', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    applyColorway();
    viewer?.setColors(...colourHexes());
  }));
}

/** Import the viewer module (and three.js) on the first request only. */
async function ensureViewer() {
  if (viewer) return viewer;
  const stage = $('#stage');
  stage.classList.add('is-open'); $('#poster').hidden = true;
  const mod = await import(`./viewer.js?v=${document.documentElement.dataset.v || '0'}`);
  status = mod.overlayStatus(stage);
  try {
    viewer = await mod.createViewer({ canvas: $('#scene'), onStatus: s => { status.onStatus(s); if (s.phase === 'ready') stage.dataset.triangles = Math.round(s.triangles); } });
  } catch (err) {
    status.fail('WebGL is not available in this browser. The pictures on this page show the same files.', err);
    throw err;
  }
  $$('[data-view]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.view === 'reset') { viewer.setGroupRotation(0); viewer.setView('angled'); } else viewer.setView(b.dataset.view);
  }));
  $('#toggle-stand').addEventListener('change', async e => {
    try { await viewer.showStand(e.target.checked, catalog.extras.stand.mesh || catalog.extras.stand.path); }
    catch (err) { e.target.checked = false; toast('Stand could not be loaded: ' + err.message); }
  });
  $('#toggle-spin').addEventListener('change', e => viewer.setSpin(e.target.checked));
  $('#retry').addEventListener('click', () => currentVersion && openVersion(currentVersion.id, true));
  return viewer;
}

function setupStudio() {
  renderColorways();
  $('#open-3d').addEventListener('click', async () => {
    try { await ensureViewer(); } catch { return; }
    if (currentVersion) openVersion(currentVersion.id, true);
  });
  $('#rate-export')?.addEventListener('click', async () => {
    const out = JSON.stringify({ ratings: Object.entries(ratings()).map(([n, v]) => ({ concept: Number(n), score: v })) }, null, 1);
    try { await navigator.clipboard.writeText(out); toast('Ratings copied: paste into data/plaque-ratings.json'); }
    catch { prompt('Copy your ratings:', out); }
  });
  $('#prev-design').addEventListener('click', () => step(-1));
  $('#next-design').addEventListener('click', () => step(1));
}

function step(dir) {
  if (!currentVersion) return;
  const i = catalog.designs.findIndex(d => d.id === currentVersion.design.id);
  const d = catalog.designs[(i + dir + catalog.designs.length) % catalog.designs.length];
  location.hash = `#studio/${d.versions[0].id}`;
}

function route(initial) {
  const m = location.hash.match(/^#studio\/([\w-]+)(?:&|$)/);
  if (m) {
    ensureViewer().then(() => openVersion(m[1], true)).catch(() => openVersion(m[1]));
    if (!initial) $('#studio').scrollIntoView({ block: 'start' });
    else {
      history.scrollRestoration = 'manual';
      const jump = () => $('#studio').scrollIntoView({ block: 'start', behavior: 'instant' });
      setTimeout(jump, 60);
      if (document.readyState !== 'complete') window.addEventListener('load', () => setTimeout(jump, 60), { once: true });
    }
  } else if (!currentVersion) {
    openVersion(versions[0].id, false, true);
  }
}

async function openVersion(id, force = false, quiet = false) {
  const v = versions.find(x => x.id === id);
  if (!v) { toast(`No version called “${id}”`); return; }
  if (currentVersion?.id === id && !force) return;
  currentVersion = v;
  renderVersionTabs(v);
  renderInfo(v);
  renderCompare(v.design);
  applyColorway();
  $('#studio-intro').textContent = `Concept ${v.design.number} · ${v.label} · ${v.size_mm.join(' × ')} mm. ${v.meshes.stars ? 'The large star and small stars are a separate orange mesh. The orange filament profile is a placeholder: select the profile for your translucent spool and re-slice.' : 'The 3D view shows the real plaque body and recessed floor meshes.'}`;
  const poster = $('#poster-img'); poster.src = v.design.source.thumb; poster.alt = `Engraving source for concept ${v.design.number}.`;
  const has3d = String(v.meshes.body).startsWith('media/viewer/');
  $('#open-3d').hidden = !has3d; $('#no-3d').hidden = has3d;
  if (!viewer) return;
  const overlay = $('#overlay');
  if (!has3d) { status.fail('No 3D preview at this size. The signed 195 mm version shows the same artwork.', ''); return; }
  if (!v.meshes.body_exists || !v.meshes.floor_exists) {
    overlay.hidden = false; $('#overlay-title').textContent = 'This version has no mesh files on disk.'; $('#overlay-detail').textContent = `${v.meshes.body} · ${v.meshes.floor}`; $('#overlay-bar').style.width = '0%';
    return;
  }
  try {
    await viewer.load(v, colourHexes());
  }
  catch (err) {
    if (err?.name === 'AbortError') return;
    overlay.hidden = false; $('#overlay-title').textContent = 'The model could not be loaded.'; $('#overlay-detail').textContent = String(err.message || err); $('#overlay-actions').hidden = false;
  }
}

function renderVersionTabs(v) {
  const box = $('#version-tabs');
  box.innerHTML = v.design.versions.map(x => `<button type="button" role="tab" aria-selected="${x.id === v.id}" data-ver="${x.id}">${x.signed ? '✎ ' : ''}${esc(x.label)} <span class="tag tag-paper" style="font-size:.7rem">${x.size_mm[0]} mm</span></button>`).join('');
  $$('[data-ver]', box).forEach(b => b.addEventListener('click', () => { location.hash = `#studio/${b.dataset.ver}`; }));
}

function stage(cls, text) { return `<span class="stage ${cls}">${esc(text)}</span>`; }

function evidenceList(v) {
  const d = v.design, items = [];
  items.push([stage('ok', 'Concept art'), `Sheet crop from <code>${esc(d.concept.sheet)}</code>. Rendered idea, not a model.`]);
  items.push([d.source.exists ? stage('ok', 'Source') : stage('bad', 'Source missing'), `<code>${esc(d.source.path)}</code>, 1254 × 1254 px stencil.${d.source.previous_version ? ' An earlier reconstruction is kept in <code>previous-reconstructions/</code>.' : ''}`]);
  const g = v.geometry;
  if (g?.body) items.push([g.body.watertight && g.accent.watertight ? stage('ok', 'Geometry') : stage('warn', 'Geometry'), `Body ${g.body.faces.toLocaleString()} faces, ${g.body.watertight ? 'watertight' : 'NOT watertight'} · floor ${g.accent.faces.toLocaleString()} faces in ${g.accent.components} islands, ${g.accent.watertight ? 'watertight' : 'NOT watertight'}. Recess ${g.recess_depth_mm} mm, floor ${g.accent_thickness_mm} mm.`]);
  else items.push([v.meshes.body_exists && v.meshes.floor_exists ? stage('warn', 'Geometry') : stage('bad', 'Geometry'), `${v.meshes.body_exists ? 'STL meshes exist' : 'Mesh files missing'} (${mb(v.meshes.body_bytes)} + ${mb(v.meshes.floor_bytes)}). ${esc(g?.caveat || '')}`]);
  const s = v.slice.yellow_red;
  const bound = v.files.flatMap(f => (f.evidence || []).map(e => ({ f, e })));
  if (s && s.ok) {
    let txt = `Bambu Studio CLI, ${s.layer_height_mm} mm layers, ${s.filament_ids.length} filaments (${s.filament_ids.join(', ')}), no warning. ≈ ${s.hours} h, ${s.grams_total} g (${s.grams_per_filament[1]} g in colour 2). <span class="muted">${esc(v.slice.yellow_red_source)}</span>`;
    if (v.slice.note) txt += ` ${esc(v.slice.note)}`;
    const fails = bound.filter(x => x.e.matches_current_file && !x.e.result.ok);
    items.push([fails.length && !v.signed ? stage('warn', 'Slice: see files') : stage('ok', 'Slice clean'), txt]);
  } else if (s) items.push([stage('bad', 'Slice failed'), `${esc(s.error || s.warning || 'return code ' + s.return_code)}`]);
  else items.push([stage('none', 'No slice'), 'No slicer result is recorded for this version.']);
  for (const { f, e } of bound) {
    const r = e.result;
    items.push([r.ok ? stage('ok', 'Exact file sliced') : stage('bad', 'Exact file fails'), `${esc(f.label)}: ${r.ok ? `clean, ≈ ${r.hours} h, ${r.grams_total} g` : esc(r.error.split('.')[0])}. ${e.matches_current_file ? 'The file on disk still has the hash that was sliced' : 'The file has changed since this slice'} (${fmtDate(e.sliced_at)}).`]);
  }
  const pp = v.physical_print, ppCls = { success: 'ok', issues: 'warn', failed: 'bad', printed: 'ok' }[pp.status] || 'none';
  const ppLbl = { success: 'Printed OK', issues: 'Printed, issues', failed: 'Print failed', printed: 'Printed' }[pp.status] || 'Physical print';
  const ppDetail = (pp.entries || []).map(e => `<br><span class="small">${esc(e.date || '')} · ${esc(e.printer || '')}${e.filaments ? ' · ' + esc(e.filaments.join(' + ')) : ''}: ${esc(e.notes || e.result)}${e.photo ? ` · <a href="${esc(e.photo)}">photo</a>` : ''}</span>`).join('');
  items.push([stage(ppCls, ppLbl), esc(pp.note) + ppDetail]);
  return `<ul class="evidence">${items.map(([a, b]) => `<li>${a}<span>${b}</span></li>`).join('')}</ul>`;
}

function plateSvg(v) {
  const candidates = v.files.filter(x => x.kind === '3mf' && x.exists && x.settings && x.status !== 'superseded');
  const f = candidates.find(x => (x.evidence || []).some(e => e.matches_current_file && e.result.ok)) || candidates[0];
  if (!f) return '';
  const s = v.slice.yellow_red, bed = f.settings.bed_mm || 256, size = v.size_mm[0];
  const bound = (f.evidence || []).find(e => e.matches_current_file && e.result.bbox_mm);
  const bb = bound?.result.bbox_mm || (s?.bbox_mm?.width === size ? s.bbox_mm : null);
  const px = bb ? bb.x : 141 - size / 2, py = bb ? bb.y : 128 - size / 2;
  const t = f.settings.prime_tower, tw = t.width_mm + 2 * t.brim_mm;
  const sc = 220 / bed, X = x => 20 + x * sc, Y = y => 20 + (bed - y) * sc;
  const collide = !(t.x + tw <= px || t.x >= px + size || t.y + tw <= py || t.y >= py + size);
  return `<svg class="plate" viewBox="0 0 260 260" role="img" aria-label="Plate layout: ${size} mm plaque and a ${t.width_mm} mm prime tower on a ${bed} mm bed">
    <rect x="20" y="20" width="${bed * sc}" height="${bed * sc}" fill="#f8f3ff" stroke="#2a1824" stroke-width="1.5"/>
    <rect x="${X(px)}" y="${Y(py + size)}" width="${size * sc}" height="${size * sc}" fill="#ffe08a" stroke="#2a1824" stroke-width="1.5"/>
    <rect x="${X(t.x)}" y="${Y(t.y + tw)}" width="${tw * sc}" height="${tw * sc}" fill="${collide ? '#ffb3ad' : '#b6f0d2'}" stroke="#2a1824" stroke-width="1.5"/>
    <text x="${X(px) + 6}" y="${Y(py + size) + 14}">${size} mm plaque</text>
    <text x="${X(t.x) + 2}" y="${Y(t.y + tw) - 4}" style="font-size:9px">tower ${t.width_mm}+${t.brim_mm} mm @ (${Math.round(t.x)}, ${Math.round(t.y)})</text>
    <text x="22" y="252" style="font-size:9px;fill:#5a3b4f">${bed} × ${bed} mm bed · plaque from ${bb ? 'slice result' : 'file transform'}${collide ? ' · boxes overlap' : ''}</text>
  </svg><p class="small muted" style="margin:6px 0 0">Layout read from <code>${esc(f.path.split('/').pop())}</code>.${collide ? ' The tower box overlaps the plaque box; see the CLI result on that file.' : ''}</p>`;
}

function fileCard(f) {
  if (!f.exists) return `<li class="file missing"><div class="row"><span class="name">${esc(f.label)}</span>${stage('bad', 'missing')}</div><p class="note">${esc(f.path)} was not found.</p></li>`;
  const st = { prototype: ['warn', 'prototype · not printed'], verify_filament: ['warn', 'verify filament'], prototype_signed: ['warn', 'prototype · signed'], superseded: ['none', 'earlier save'] }[f.status] || (f.kind === 'stl' ? ['none', 'mesh · ' + (f.part || 'part')] : null);
  let meta = `<span>${mb(f.bytes)}</span><span>${fmtDate(f.modified)}</span>`;
  let extra = '';
  if (f.settings) {
    const s = f.settings;
    meta += `<span class="sw">${(s.filament_colour || []).map(c => `<i style="background:${esc(c.slice(0, 7))}" title="${esc(c)}"></i>`).join('')} ${(s.filament_colour || []).map(c => c.slice(0, 7)).join(' / ')}</span>`;
    extra += `<p class="note">Profiles: ${esc((s.filament_settings_id || []).join(' + '))} · ${esc(s.printer || '')} · ${s.layer_height_mm} mm layers · tower ${s.prime_tower.width_mm} mm at (${s.prime_tower.x}, ${s.prime_tower.y})${s.saved_by_bambu_studio_gui ? ' · saved from the Bambu Studio GUI' : ' · generated by package_plaque.py'}.</p>`;
  }
  if (f.note) extra += `<p class="note">${esc(f.note)}</p>`;
  if (f.restored_from) extra += `<p class="note">Unmodified copy extracted from <code>${esc(f.restored_from)}</code>.</p>`;
  for (const e of f.evidence || []) {
    const r = e.result;
    extra += `<p class="note">${r.ok ? '✅' : '⛔'} CLI slice of ${e.matches_current_file ? 'this exact file' : 'an earlier version of this file'} (${fmtDate(e.sliced_at)}): ${r.ok ? `clean, ≈ ${r.hours} h, ${r.grams_total} g` : esc(r.error)}</p>`;
  }
  return `<li class="file"><div class="row"><span class="name">${esc(f.label)}</span>${st ? stage(st[0], st[1]) : ''}</div><div class="meta">${meta}</div>${extra}<div class="row"><a class="btn btn-sm" href="${esc(f.path)}" download>Download ${esc(f.path.split('/').pop())}</a></div></li>`;
}

function renderInfo(v) {
  const d = v.design, g = v.geometry, s = v.slice.yellow_red;
  // order files: the recommended unmodified copy first when a re-saved file exists
  const files = [...v.files].sort((a, b) => (a.restored_from ? -1 : 0) - (b.restored_from ? -1 : 0));
  $('#info').innerHTML = `
    <div class="sticker">
      <h3 style="margin:0 0 6px">Concept ${d.number}${v.signed ? ' · signed' : ''}</h3>
      <div class="tags" style="margin-bottom:10px">${cardTags(d)}${v.signed ? '<span class="tag">ティルニノクサ engraved</span>' : ''}</div>
      <dl class="kv">
        <dt>Size</dt><dd>${v.size_mm.join(' × ')} mm, flat back</dd>
        <dt>Recess</dt><dd>${g?.recess_depth_mm ?? 1} mm deep, ${g?.accent_thickness_mm ?? 0.24} mm colour floor</dd>
        <dt>Frame</dt><dd>8 mm on each side (artwork area ${v.size_mm[0] - 16} mm)</dd>
        <dt>Characters</dt><dd>${esc(d.characters.join(' and '))}</dd>
        ${v.signed ? `<dt>Signature</dt><dd>${esc(v.signature.artist)} as <span lang="ja">${esc(v.signature.katakana)}</span>, ${esc(v.signature.position)}, inside the frame · <a href="${esc(v.signature.image)}">signature.png</a></dd>` : ''}
        ${s?.ok ? `<dt>Slice estimate</dt><dd>${s.hours} h · ${s.grams_total} g PLA · ${s.filament_changes} filament changes</dd>` : ''}
      </dl>
    </div>
    <div class="sticker"><h3 style="margin:0 0 10px">Evidence</h3>${evidenceList(v)}</div>
    <div class="sticker"><h3 style="margin:0 0 10px">Plate layout</h3>${plateSvg(v) || '<p class="muted small">No project file to read a layout from.</p>'}<p class="small muted" style="margin:8px 0 0">Positions come from the 3MF settings and the slice result. Only the slicer can confirm clearance.</p></div>
    ${v.plate_thumbnail ? `<div class="sticker"><h3 style="margin:0 0 10px">Slicer preview</h3><img src="${esc(v.plate_thumbnail)}" alt="Plate thumbnail stored inside the 3MF by Bambu Studio" style="border:2px solid var(--ink);border-radius:12px;background:#fff" width="512" height="512"><p class="small muted" style="margin:8px 0 0">Stored inside the 3MF by Bambu Studio; colours are the file's filament colours.</p></div>` : ''}
    <div class="sticker"><h3 style="margin:0 0 10px">Files</h3><ul class="files">${files.map(fileCard).join('')}</ul></div>`;
}

function setupCompare() {
  const pair = $('#cmp-pair'), ov = $('#cmp-overlay'), rng = $('#cmp-range'), slider = $('#cmp-slider');
  $$('[data-cmp]').forEach(b => b.addEventListener('click', () => {
    $$('[data-cmp]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const overlay = b.dataset.cmp === 'overlay';
    pair.hidden = overlay; ov.hidden = !overlay; rng.hidden = !overlay;
  }));
  slider.addEventListener('input', () => { $('#cmp-overlay-b').style.opacity = slider.value / 100; });
}

// Plaque ratings: saved in this browser only; "Copy my ratings" exports JSON for data/plaque-ratings.json.
const RATE_KEY = 'plaque-ratings-v1';
function ratings() { try { return JSON.parse(localStorage.getItem(RATE_KEY) || '{}'); } catch { return {}; } }
function setRating(n, v) { const r = ratings(); r[n] = v; try { localStorage.setItem(RATE_KEY, JSON.stringify(r)); } catch { /* private mode */ } }
function renderRating(d) {
  const box = $('#rate-buttons'); if (!box) return;
  const mine = ratings()[d.number];
  box.innerHTML = [1, 2, 3, 4, 5].map(v => `<button type="button" aria-pressed="${mine === v}" data-rate="${v}" aria-label="${v} of 5">${v}</button>`).join('');
  $$('[data-rate]', box).forEach(b => b.addEventListener('click', () => { setRating(d.number, Number(b.dataset.rate)); renderRating(d); toast(`Concept ${d.number}: ${b.dataset.rate}/5 saved in this browser`); }));
  const off = d.rating;
  $('#rate-official').textContent = off ? `Joona's rating: ${off.score}/5${off.note ? ' — ' + off.note : ''}` : 'Not rated yet. Your rating stays in your browser.';
}

function renderCompare(d) {
  const c = $('#cmp-concept'), s = $('#cmp-source');
  c.src = d.concept.crop; c.alt = `Concept ${d.number} as rendered on the concept sheet.`;
  s.src = d.source.thumb; s.alt = `Engraving source for concept ${d.number}.`;
  $('#cmp-overlay-a').src = d.concept.crop; $('#cmp-overlay-b').src = d.source.thumb;
  for (const img of [c, s]) img.onerror = () => { img.alt += ' (image missing)'; };
  renderRating(d);
}

function renderDownloads() {
  const tb = $('#download-table tbody');
  tb.innerHTML = versions.map(v => {
    const d = v.design, s = v.slice.yellow_red;
    const ordered = [...v.files].sort((a, b) => (a.restored_from ? -1 : 0) - (b.restored_from ? -1 : 0));
    const threes = ordered.filter(f => f.kind === '3mf' && f.status !== 'superseded');
    const stls = v.files.filter(f => f.kind === 'stl');
    const link = f => f.exists ? `<a href="${esc(f.path)}" download>${esc(f.path.split('/').pop())}</a> <span class="mini">${mb(f.bytes)}</span>` : `<span class="mini">${esc(f.path.split('/').pop())} missing</span>`;
    const bad = v.files.some(f => (f.evidence || []).some(e => e.matches_current_file && !e.result.ok));
    return `<tr><td><a href="#studio/${v.id}">Concept ${d.number}</a>${d.characters.includes('Lelouch') ? '<div class="mini">with Lelouch</div>' : ''}</td>
      <td>${esc(v.label)}<div class="mini">${v.size_mm.join(' × ')} mm${v.signed ? ' · signed' : ''}</div></td>
      <td>${threes.map(f => `<div>${link(f)}${f.colorway === 'orange_yellow' ? '<div class="mini">colours swapped, placeholder profiles</div>' : ''}${f.restored_from ? '<div class="mini">unmodified copy from the zip</div>' : ''}${(f.evidence || []).filter(e => e.matches_current_file && !e.result.ok).length ? '<div class="mini" style="color:var(--bad)">this file fails the CLI slice (tower conflict)</div>' : ''}</div>`).join('')}</td>
      <td>${stls.map(f => `<div>${link(f)}</div>`).join('')}</td>
      <td>${s ? (s.ok ? `${stage('ok', 'clean')} <div class="mini">${s.hours} h · ${s.grams_total} g · ${s.layer_height_mm} mm</div>` : stage('bad', 'failed')) : stage('none', 'none')}</td>
      <td>${v.physical_print.status === 'success' ? stage('ok', 'test-printed') : v.physical_print.status === 'none' ? stage('warn', 'prototype') : stage('warn', 'print: ' + v.physical_print.status)}${bad ? `<div class="mini">see file note</div>` : ''}</td></tr>`;
  }).join('');
  const x = catalog.extras;
  $('#download-extras').innerHTML = [
    x.stand.exists ? `<a class="btn btn-sm" href="${esc(x.stand.path)}" download>Shelf stand STL · ${mb(x.stand.bytes)}</a>` : '',
    x.zip.exists ? `<a class="btn btn-sm" href="${esc(x.zip.path)}" download>All 25 prototypes (zip) · ${mb(x.zip.bytes)}</a>` : '',
    `<a class="btn btn-sm btn-ghost" href="${esc(x.docs.showcase)}">SHOWCASE.md</a>`,
    `<a class="btn btn-sm btn-ghost" href="${esc(x.docs.quality_report)}">QUALITY_REPORT.json</a>`,
  ].join('');
}

function setupNav() {
  const links = $$('.nav a');
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) links.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'));
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));
}

boot();
