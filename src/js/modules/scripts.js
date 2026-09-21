const html = document.documentElement;

if (/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)) {
  html.classList.add("touch");
}

window.addEventListener("load", () => setTimeout(() => html.classList.add("loaded"), 0));

let prevClientHeight;
const setViewportProperty = () => {
  const clientHeight = html.clientHeight;
  if (clientHeight === prevClientHeight) return;
  requestAnimationFrame(() => {
    html.style.setProperty("--vh", `${clientHeight * 0.01}px`);
    prevClientHeight = clientHeight;
  });
};
setViewportProperty();
window.addEventListener("resize", setViewportProperty);
