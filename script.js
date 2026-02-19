const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll(".sparkle").forEach((el, i) => {
  el.style.animationDelay = `${i * 0.55}s`;
});

function initSpiral(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const S = 280 * window.devicePixelRatio;
  canvas.width = S; canvas.height = S;
  const cx = S/2, cy = S/2, maxR = S*0.46;
  const spacing = S*0.012, totalTheta = (maxR/spacing)*Math.PI*2;
  const GLYPHS = 900, FONT_SIZE = Math.max(6, S*0.016);
  let time = Math.random() * 100; // offset so they don't look identical

  function bitAt(i) {
    let x = (i*1664525+1013904223)|0;
    x^=x<<13; x^=x>>>17; x^=x<<5;
    return (x>>>0)&1;
  }

  function draw() {
    ctx.fillStyle = "#F5EEF0";
    ctx.fillRect(0,0,S,S);
    ctx.font = `300 ${FONT_SIZE}px 'DM Mono', monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    for (let i=0; i<GLYPHS; i++) {
      const theta = (i/(GLYPHS-1))*totalTheta;
      let r = (theta/(Math.PI*2))*spacing;
      r += Math.sin(theta*6+r*0.04+time)*(S*0.003);
      if (r>maxR) continue;
      const x = cx+r*Math.cos(theta), y = cy+r*Math.sin(theta);
      const alpha = Math.max(0, 1-(r/maxR)*1.02);
      const bit = bitAt(i);
      ctx.fillStyle = bit
        ? `rgba(30,18,24,${(0.15+0.75*alpha).toFixed(3)})`
        : `rgba(200,140,165,${(0.10+0.50*alpha).toFixed(3)})`;
      ctx.fillText(bit?"1":"0", x, y);
    }
    time += 0.010;
    requestAnimationFrame(draw);
  }
  draw();
}

initSpiral("spiral-left");
initSpiral("spiral-right");
