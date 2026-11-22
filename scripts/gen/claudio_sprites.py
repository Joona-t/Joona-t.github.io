"""Generate the Bvby Ash page's Claudio sprite symbols: one shared pixel body + one face/accessory per club variant
(lovespark-pop models/claudio: classic, cyber, shades, headphones, crown, snapback, bunny) and the hero's
cyber-visor + headphones combo. Prints the <linearGradient> and <symbol> markup to paste into bvby-ash/index.html."""
O, D, M, K, W = "var(--cl-o)", "var(--cl-d)", "var(--cl-m)", "#14101a", "#ffffff"
PINK, PINK_L, GOLD, GOLD_D, CAP, PRISM = "#f58ac0", "#ffc9e3", "#f2c94c", "#c99a1e", "#2b2433", "url(#cl-prism)"


def body(face_rows_orange=True):
    r = [(4, 0, 8, 1, O), (2, 1, 12, 1, O), (1, 2, 14, 1, O)]
    r += [(1, y, 14, 1, O) for y in range(3, 8)]                       # face area: plain orange, faces are drawn on top
    r += [(1, 8, 6, 1, O), (7, 8, 2, 1, M), (9, 8, 6, 1, O),           # mouth row (pink mouth pixel pair)
          (1, 9, 1, 1, D), (2, 9, 12, 1, O), (14, 9, 1, 1, D), (2, 10, 12, 1, D),
          (2, 11, 1, 1, D), (5, 11, 1, 1, D), (10, 11, 1, 1, D), (13, 11, 1, 1, D)]
    return r


EYES = [(5, 4, 1, 1, K), (4, 5, 1, 1, K), (6, 5, 1, 1, K), (10, 4, 1, 1, K), (9, 5, 1, 1, K), (11, 5, 1, 1, K)]   # ^ ^
SHADES = [(1, 3, 14, 1, K), (2, 4, 1, 1, K), (3, 4, 2, 1, W), (5, 4, 5, 1, K), (10, 4, 2, 1, W), (12, 4, 2, 1, K),
          (2, 5, 1, 1, K), (3, 5, 1, 1, W), (4, 5, 6, 1, K), (10, 5, 1, 1, W), (11, 5, 3, 1, K),
          (3, 6, 4, 1, K), (10, 6, 3, 1, K)]                                           # the page's original pixel shades
VISOR = [(0, 3, 16, 3, PRISM), (1, 3, 14, 1, "rgba(255,255,255,.55)"), (0, 6, 16, 1, "#d7dbe6")]      # prismatic visor band
PHONES = [(3, -2, 10, 1, PINK), (2, -1, 1, 1, PINK), (13, -1, 1, 1, PINK), (1, 0, 1, 2, PINK), (14, 0, 1, 2, PINK),
          (0, 2, 2, 4, PINK_L), (14, 2, 2, 4, PINK_L), (0, 3, 1, 2, PRISM), (15, 3, 1, 2, PRISM)]    # band + rainbow ear rings
CROWN = [(4, -1, 8, 1, GOLD_D), (4, -3, 1, 2, GOLD), (7, -4, 2, 3, GOLD), (11, -3, 1, 2, GOLD), (5, -2, 6, 1, GOLD),
         (7, -1, 2, 1, PINK)]
SNAP = [(3, -1, 11, 1, CAP), (13, -1, 3, 1, CAP), (5, -2, 7, 1, CAP), (7, -3, 2, 1, PINK)]
# white ears get a dark pixel outline so they read on the light theme's white card too
BUNNY = [(3, -5, 4, 4, K), (9, -5, 4, 4, K),
         (4, -4, 2, 3, W), (10, -4, 2, 3, W), (5, -3, 1, 2, PINK_L), (10, -3, 1, 2, PINK_L), (3, -1, 10, 1, PINK)]

VARIANTS = {
    "classic": EYES, "shades": SHADES, "cyber": VISOR, "headphones": EYES + PHONES,
    "crown": EYES + CROWN, "snapback": EYES + SNAP, "bunny": EYES + BUNNY, "cyberphones": VISOR + PHONES,
}
ARMS = ('<g class="arm arm-l"><rect x="-2" y="6" width="2" height="1" fill="var(--cl-d)"/><rect x="-4" y="4" width="2" height="3" fill="var(--cl-o)"/></g>'
        '<g class="arm arm-r"><rect x="16" y="6" width="2" height="1" fill="var(--cl-d)"/><rect x="18" y="4" width="2" height="3" fill="var(--cl-o)"/></g>')


def rects(rs):
    return "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{f}"/>' for x, y, w, h, f in rs)


print('      <linearGradient id="cl-prism" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff3b8d"/>'
      '<stop offset=".2" stop-color="#ffb23c"/><stop offset=".4" stop-color="#ffe14f"/><stop offset=".6" stop-color="#5dff9e"/>'
      '<stop offset=".8" stop-color="#3ef0ff"/><stop offset="1" stop-color="#c46bff"/></linearGradient>')
for name, face in VARIANTS.items():
    # viewBox reaches 5 pixels above the head for ears, crowns and caps (a symbol clips outside its viewBox)
    # crispEdges: pixel art, no anti-aliased seams between the stacked pixel rows
    print(f'      <symbol id="cl-{name}" viewBox="-4 -5 24 18" shape-rendering="crispEdges">{rects(body() + face)}{ARMS}</symbol>')
