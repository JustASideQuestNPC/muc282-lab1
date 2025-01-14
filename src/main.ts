// for disabling and reenabling keyboard input
let canvasHovered = true;

function setup() {
    const canvas = createCanvas(400, 400);

    // WHY DO THESE USE CALLBACKS????
    canvas.mouseOver(() => {
        canvasHovered = true;
    });
    canvas.mouseOut(() => {
        canvasHovered = false;
    });

    // this is the only way to make mouse functions only trigger when the mouse is actually over the
    // canvas. I SHOULD NOT HAVE TO DO THIS.
    canvas.mousePressed(_mousePressed);
    canvas.mouseReleased(_mouseReleased);

    // this is, as far as i'm aware, the only way to disable the right-click menu without also
    // disabling it for the entire webpage. I SHOULD NOT HAVE TO DO THIS EITHER.
    document.querySelector("canvas").addEventListener("contextmenu", e => e.preventDefault());
}

function draw() {
    background("#e0e0e0");
}

function _mousePressed() {
    console.log(`pressed ${mouseButton}`);
}

function _mouseReleased() {
    console.log(`pressed ${mouseButton}`);
}

function keyPressed(event: KeyboardEvent) {
    // only run when the mouse is over the canvas; also makes F12 open the debug console instead of
    // interacting with the sketch
    if (canvasHovered && event.key !== "F12") {
        console.log(`pressed ${event.key}`);

        // prevents default browser behavior
        return false
    }
}

function keyReleased(event: KeyboardEvent) {
    // only run when the mouse is over the canvas; also makes F12 open the debug console instead of
    // interacting with the sketch
    if (canvasHovered && event.key !== "F12") {
        console.log(`released ${event.key}`);

        // prevents default browser behavior
        return false
    }
}