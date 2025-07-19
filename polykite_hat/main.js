let mouse_pos = { x: 0, y: 0 };
const PK_aspect_ratio = 1.3530292050081785;
const offset = { x: 0.55, y: 0.5 };
let HAT_POS = { x: 0, y: 0 };
let HAT_ANGLE = 0;
let HAT_FLIP = { x: 1, y: 1 };

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('click', handleMouseClick);
document.addEventListener('DOMContentLoaded', onload);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('wheel', handleMouseWheel);

function onload() {
    let hat = document.getElementById('hat');
    offset.x *= hat.width.baseVal.value
    offset.y *= hat.height.baseVal.value
}

function handleKeyDown(event) {
    if (event.code === 'Space' || event.keyCode === 32) {
        HAT_FLIP.x = -HAT_FLIP.x;
    }
    updateHatPosition();
}

function handleMouseClick(event) {
    if (event.button === 0) {
        hat = hat.cloneNode(true);
        document.body.appendChild(hat);
    }
    }

function handleMouseWheel(event) {
    // event.preventDefault();
    if (event.deltaY > 0) {
        HAT_ANGLE += 12;
    } else {
        HAT_ANGLE -= 12;
    }
    HAT_ANGLE = HAT_ANGLE % 360; // Keep the angle within 0-360 degrees
    updateHatPosition();
}

// Add event listener for mouse wheel

function handleMouseMove(event) {
    mouse_pos.x = event.clientX;
    mouse_pos.y = event.clientY;

    HAT_POS = { x: mouse_pos.x - offset.x, y: mouse_pos.y - offset.y };

    updateHatPosition();
}

function updateHatPosition() {
    hat.style.transform = `translate(${HAT_POS.x}px, ${HAT_POS.y}px) rotate(${HAT_ANGLE}deg) scale(${HAT_FLIP.x}, ${HAT_FLIP.y})`;
}