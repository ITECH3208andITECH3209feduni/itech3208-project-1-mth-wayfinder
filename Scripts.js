let map = document.querySelector(".map");

let scale = 1;
let posX = 0;
let posY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;


/* Zoom in and out */
window.addEventListener("wheel", (e) => {
  e.preventDefault();

  let zoomSpeed = 0.1;

  if (e.deltaY < 0) scale += zoomSpeed;
  else scale -= zoomSpeed;

/* Max zoom in and min zoom Out */
  scale = Math.min(Math.max(scale, 0.7), 2);

  updateMap();
}, { passive: false });


/* Moues drag*/
map.addEventListener("mousedown", (e) => {
  isDragging = true;

  startX = e.clientX - posX;
  startY = e.clientY - posY;
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  posX = e.clientX - startX;
  posY = e.clientY - startY;

  updateMap();
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});


/* ================= MOBILE TOUCH SUPPORT ================= */
map.addEventListener("touchstart", (e) => {
  isDragging = true;

  let touch = e.touches[0];
  startX = touch.clientX - posX;
  startY = touch.clientY - posY;
});

window.addEventListener("touchmove", (e) => {
  if (!isDragging) return;

  let touch = e.touches[0];

  posX = touch.clientX - startX;
  posY = touch.clientY - startY;

  updateMap();
});

window.addEventListener("touchend", () => {
  isDragging = false;
});


/* ================= APPLY TRANSFORM ================= */
function updateMap() {
  map.style.transform =
    `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scale(${scale})`;
}


/* Open Menu */
function openMenu() {
  document.getElementById("poiMenu").style.display = "block";
}
/* Close Menu  */
function closeMenu() {
  document.getElementById("poiMenu").style.display = "none";
}