// 3D print viewer: real STL meshes as a list of parts, one colour per part. three.js (vendored, bundled into
// vendor/three.bundle.js). Loaded only when the visitor opens a 3D view, never on page load (scripts/budget.py).
// The paint tool that used to live here is in tools/paint/ (taken off the site 2026-10-31).
// three.js is imported here, not at the top, so its URL can carry the page's version stamp (no stale cache after a deploy).
const V = document.documentElement.dataset.v || '0';
let THREE = null;
async function three() {
  THREE ??= await import(`../vendor/three.bundle.js?v=${V}`);
  return THREE;
}

/** LSM1 (scripts/viewer_meshes.py): "LSM1", u32 vertices, u32 triangles, u8 index bytes, f32 lo[3], f32 span[3],
 *  then u16 quantized positions and u16/u32 triangle indices. Returns an indexed BufferGeometry in millimetres. */
function parseLSM(buf) {
  const dv = new DataView(buf);
  if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== 'LSM1') throw new Error('not an LSM1 mesh');
  const nv = dv.getUint32(4, true), nf = dv.getUint32(8, true), ib = dv.getUint8(12);
  const lo = [dv.getFloat32(13, true), dv.getFloat32(17, true), dv.getFloat32(21, true)];
  const span = [dv.getFloat32(25, true), dv.getFloat32(29, true), dv.getFloat32(33, true)];
  let o = 37;
  const q = new Uint16Array(buf.slice(o, o + nv * 6)); o += nv * 6;
  const pos = new Float32Array(nv * 3);
  for (let i = 0; i < nv * 3; i++) pos[i] = lo[i % 3] + q[i] / 65535 * span[i % 3];
  const idx = ib === 4 ? new Uint32Array(buf.slice(o, o + nf * 12)) : new Uint16Array(buf.slice(o, o + nf * 6));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeVertexNormals();
  return geo;
}

/** Binary STL (only used if a raw STL is ever handed to the viewer). */
function parseSTL(buf) {
  const dv = new DataView(buf), n = dv.getUint32(80, true), pos = new Float32Array(n * 9);
  for (let i = 0, o = 84; i < n; i++, o += 50) for (let k = 0; k < 9; k++) pos[i * 9 + k] = dv.getFloat32(o + 12 + k * 4, true);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}
const parseMesh = buf => (new Uint8Array(buf, 0, 4).join(',') === '76,83,77,49' ? parseLSM(buf) : parseSTL(buf));
const MAX_CACHED = 3;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEFAULTS = ['#f7d959', '#de4343', '#ff8b16', '#ffffff', '#71c829'];

export async function createViewer({ canvas, onStatus }) {
  await three();
  const { OrbitControls } = THREE;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 4000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.9;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.keyPanSpeed = 12;

  scene.add(new THREE.HemisphereLight(0xfff1f6, 0x3a2448, 0.9));
  const key = new THREE.DirectionalLight(0xfff4e0, 2.1); key.position.set(0.6, 0.9, 1.4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfe0ff, 0.7); fill.position.set(-1, 0.3, 0.6); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xff9ad0, 0.8); rim.position.set(0.2, -0.4, -1); scene.add(rim);
  const backKey = new THREE.DirectionalLight(0xfff4e0, 1.7); backKey.position.set(-0.6, 0.9, -1.4); scene.add(backKey); // the back of a case is the decorated side

  const group = new THREE.Group();
  scene.add(group);
  const material = hex => new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: 0.58, metalness: 0, flatShading: true });
  const standMat = new THREE.MeshStandardMaterial({ color: 0xcdb8ff, roughness: 0.7, metalness: 0, flatShading: true, transparent: true, opacity: 0.85 });

  let meshes = [];   // THREE.Mesh per part
  let parts = [];    // { label, geo, triangles }
  const standMesh = new THREE.Mesh(new THREE.BufferGeometry(), standMat);
  standMesh.visible = false;
  standMesh.rotation.x = -Math.PI / 2; // stand STL is built height-along-Z; the plaque stands upright in XY
  scene.add(standMesh);

  const cache = new Map(); // model id -> [geo]
  let size = 225, thickness = 4, spin = false, current = null, loadToken = 0, standPromise = null;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }
  new ResizeObserver(resize).observe(canvas);

  function fitDistance() {
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const aspect = Math.max(camera.aspect, 0.6);
    const half = size * 0.56;
    return Math.max(half / Math.tan(fov / 2), half / (Math.tan(fov / 2) * aspect));
  }

  function setView(name) {
    resize();
    const d = fitDistance();
    controls.target.set(0, 0, 0);
    if (name === 'angled') camera.position.set(Math.sin(0.65) * d, Math.sin(0.32) * d, Math.cos(0.65) * d * 0.95);
    else if (name === 'back') camera.position.set(0, 0, -d);
    else camera.position.set(0, 0, d);
    controls.minDistance = size * 0.15;
    controls.maxDistance = size * 4;
    controls.update();
  }

  /** One colour per part, in part order. A missing or empty entry keeps that part's colour. */
  function setColors(...hexes) {
    hexes.forEach((h, i) => { if (meshes[i] && h) meshes[i].material.color.set(h); });
    render();
  }

  // ---------- loading ----------
  async function fetchWithProgress(url, label, token) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${label}: HTTP ${res.status} for ${url}`);
    const total = Number(res.headers.get('content-length')) || 0;
    if (!res.body) { const b = await res.arrayBuffer(); return url.endsWith('.gz') ? inflate(new Uint8Array(b), label) : b; }
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (token !== loadToken) { reader.cancel(); throw new DOMException('superseded', 'AbortError'); }
      chunks.push(value); got += value.byteLength;
      onStatus?.({ phase: 'progress', label, loaded: got, total });
    }
    const out = new Uint8Array(got);
    let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.byteLength; }
    return url.endsWith('.gz') ? inflate(out, label) : out.buffer;
  }
  async function inflate(bytes, label) {
    if (typeof DecompressionStream === 'undefined') throw new Error(`${label}: this browser cannot unpack compressed models. Download the 3MF instead.`);
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).arrayBuffer();
  }
  function evict() {
    while (cache.size > MAX_CACHED) {
      const [k, v] = cache.entries().next().value;
      if (k === current) break;
      v.forEach(g => g.dispose()); cache.delete(k);
    }
  }

  /** Plaque versions from the catalog: body, recessed floor and any extra meshes (e.g. stars). */
  function load(version, colours) {
    const ps = [{ url: version.meshes.body, label: 'Plaque body' }, { url: version.meshes.floor, label: 'Recessed floor' }];
    if (version.meshes.stars) ps.push({ url: version.meshes.stars, label: 'Orange stars' });
    return loadParts({ id: version.id, label: version.label, size_mm: version.size_mm, parts: ps, colours });
  }

  /** Any model: spec.parts = [{url, label}], spec.colours = [hex per part] (optional). */
  async function loadParts(spec) {
    const token = ++loadToken;
    current = spec.id;
    size = Math.max(spec.size_mm[0], spec.size_mm[1]);
    thickness = spec.size_mm[2];
    let geos = cache.get(spec.id);
    if (!geos) {
      onStatus?.({ phase: 'start', label: spec.label });
      meshes.forEach(m => { m.visible = false; });
      render();
      const bufs = await Promise.all(spec.parts.map(p => fetchWithProgress(p.url, p.label, token)));
      if (token !== loadToken) return;
      onStatus?.({ phase: 'parse', label: spec.label });
      await new Promise(r => setTimeout(r, 0));
      geos = bufs.map(buf => { const geo = parseMesh(buf); geo.computeBoundingBox(); geo.computeBoundingSphere(); return geo; });
      cache.set(spec.id, geos);
      evict();
    }
    if (token !== loadToken) return;
    meshes.forEach(m => group.remove(m));
    const colours = spec.colours || DEFAULTS;
    meshes = geos.map((geo, i) => { const m = new THREE.Mesh(geo, material(colours[i] || DEFAULTS[i] || '#cccccc')); group.add(m); return m; });
    parts = geos.map((geo, i) => ({ label: spec.parts[i].label, geo, triangles: geo.index ? geo.index.count / 3 : geo.getAttribute('position').count / 3 }));
    group.position.set(0, 0, -thickness / 2);
    placeStand();
    setView('angled');
    onStatus?.({ phase: 'ready', label: spec.label, triangles: parts.reduce((a, p) => a + p.triangles, 0), parts: parts.map(p => ({ label: p.label, triangles: p.triangles })) });
    render();
  }

  function placeStand() { standMesh.position.set(0, -size / 2 - 4.5, 0); }
  async function showStand(on, url) {
    if (on && !standPromise) {
      standPromise = fetch(url).then(r => { if (!r.ok) throw new Error(`Stand STL missing (${r.status})`); return r.arrayBuffer(); }).then(b => url.endsWith('.gz') ? inflate(new Uint8Array(b), 'Stand') : b)
        .then(buf => { standMesh.geometry = parseMesh(buf); })
        .catch(err => { standPromise = null; throw err; });
    }
    if (on) await standPromise;
    standMesh.visible = on;
    placeStand();
    render();
  }

  // ---------- render loop ----------
  let rafPending = false;
  function render() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; resize(); renderer.render(scene, camera); });
  }
  function tick() {
    if (spin && !reduceMotion) group.rotation.y += 0.004;
    const moved = controls.update();
    if (moved || spin) renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  controls.addEventListener('change', render);
  tick();

  // keyboard: arrows rotate, +/- zoom, 0 reset
  canvas.addEventListener('keydown', e => {
    const step = 0.12;
    const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    let handled = true;
    if (e.key === 'ArrowLeft') sph.theta -= step;
    else if (e.key === 'ArrowRight') sph.theta += step;
    else if (e.key === 'ArrowUp') sph.phi = Math.max(0.05, sph.phi - step);
    else if (e.key === 'ArrowDown') sph.phi = Math.min(Math.PI - 0.05, sph.phi + step);
    else if (e.key === '+' || e.key === '=') sph.radius = Math.max(controls.minDistance, sph.radius * 0.88);
    else if (e.key === '-' || e.key === '_') sph.radius = Math.min(controls.maxDistance, sph.radius * 1.14);
    else if (e.key === '0') { setView('front'); render(); return; }
    else handled = false;
    if (!handled) return;
    e.preventDefault();
    camera.position.setFromSpherical(sph).add(controls.target);
    camera.lookAt(controls.target);
    render();
  });

  return {
    load, loadParts, setView, setColors, showStand, render,
    get parts() { return parts; },
    setSpin(on) { spin = on; render(); },
    setGroupRotation(y) { group.rotation.y = y; render(); },
    get currentId() { return current; },
  };
}

/** Wire the overlay (loading box) of a stage to a viewer's status events. */
export function overlayStatus(stage) {
  const overlay = stage.querySelector('.overlay'), title = stage.querySelector('[data-overlay-title]'),
    bar = stage.querySelector('[data-overlay-bar]'), detail = stage.querySelector('[data-overlay-detail]');
  const mb = b => (b / 1e6).toFixed(1) + ' MB';
  let loaded = {};
  return {
    overlay, title, detail,
    onStatus(s) {
      if (s.phase === 'start') { loaded = {}; overlay.hidden = false; title.textContent = `Loading ${s.label}…`; bar.style.width = '0%'; detail.textContent = ''; }
      else if (s.phase === 'progress') {
        loaded[s.label] = s; const all = Object.values(loaded);
        const got = all.reduce((a, x) => a + x.loaded, 0), tot = all.reduce((a, x) => a + x.total, 0);
        bar.style.width = tot ? Math.round(100 * got / tot) + '%' : '30%'; detail.textContent = mb(got);
      } else if (s.phase === 'parse') { bar.style.width = '100%'; detail.textContent = 'Building the 3D shape…'; }
      else if (s.phase === 'ready') overlay.hidden = true;
    },
    fail(msg, err) { overlay.hidden = false; title.textContent = msg; detail.textContent = String(err?.message || err || ''); bar.style.width = '0%'; },
  };
}
