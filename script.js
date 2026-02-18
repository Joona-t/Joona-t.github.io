const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll(".sparkle").forEach((el, i) => {
  el.style.animationDelay = `${i * 0.55}s`;
});
