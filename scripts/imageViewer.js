const image = document.getElementById("floorPlan");

let scale = 1;
let minScale = 1;

let positionX = 0;
let positionY = 0;

let startX = 0;
let startY = 0;

let dragging = false;

function updateImage() {
    image.style.transform =
        `translate(${positionX}px, ${positionY}px) scale(${scale})`;
}

function fitImage() {
    scale = 1;
    positionX = 0;
    positionY = 0;

    updateImage();
}

image.addEventListener("wheel", (event) => {

    event.preventDefault();

    if (event.deltaY < 0) {
        scale *= 1.1;
    } else {
        scale /= 1.1;
    }

    scale = Math.max(minScale, Math.min(scale, 5));

    updateImage();
});

image.addEventListener("mousedown", (event) => {

    dragging = true;

    startX = event.clientX - positionX;
    startY = event.clientY - positionY;

    image.style.cursor = "grabbing";
});

window.addEventListener("mousemove", (event) => {

    if (!dragging) {
        return;
    }

    positionX = event.clientX - startX;
    positionY = event.clientY - startY;

    updateImage();
});

window.addEventListener("mouseup", () => {

    dragging = false;

    image.style.cursor = "grab";
});

image.addEventListener("dblclick", () => {

    fitImage();

});

window.addEventListener("resize", () => {

    fitImage();

});

image.addEventListener("load", () => {

    fitImage();

});