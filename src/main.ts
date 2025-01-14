// typescript stuff
/** A single cell in the maze. */
interface MazeCell {
    /** X coordinate in the grid. */
    x: number,
    /** Y coordinate in the grid. */
    y: number,
    /** Whether the cell connects to the cell above it. */
    up: boolean,
    /** Whether the cell connects to the cell below it. */
    down: boolean,
    /** Whether the cell connects to the cell to the left of it. */
    left: boolean,
    /** Whether the cell connects to the cell to the right of it. */
    right: boolean
};

// constants
const CANVAS_WIDTH:  number = 800;
const CANVAS_HEIGHT: number = 800;
const MAZE_WIDTH:    number =  20;
const MAZE_HEIGHT:   number =  20;

const COLORS = {
    BACKGROUND: "#808080",
    CELL_WALLS: "#000000",
    UNVISITED_CELL: "#c0c0c0",
    VISITED_CELL: "#e0e0e0",
    PATH_CELL: "#ed4545",
    HEAD_CELL: "#52f75d"
};

/** How wide each cell appears when displayed, in pixels. */
const cellDisplayWidth = CANVAS_WIDTH / MAZE_WIDTH;
/** How tall each cell appears when displayed, in pixels. */
const cellDisplayHeight = CANVAS_HEIGHT / MAZE_HEIGHT;

/** All cells in the maze. */
const mazeGrid: MazeCell[][] = [];

/** All cells that have been visited at some point. */
const visitedCells: MazeCell[] = [];

/** The cells in the current path. */
const cellPath: MazeCell[] = [];

const mazeGenerated: boolean = false;

/**
 * Returns whether an array of pairs contains a pair.
 */
function arrayContainsPair<T>(array: [T, T][], pair: [T, T]): boolean {
    for (let i = 0; i < array.length; ++i) {
        if (array[i][0] === pair[0] && array[i][1] === pair[1]) {
            return true;
        }
    }
    return false;
}

/**
 * Returns a random integer in the range [0, `high`).
 */
function randInt(high: number): number;
/**
 * Returns a random integer in the range [`low`, `high`).
 */
function randInt(low: number, high: number): number;
function randInt(low: number, high?: number): number {
    if (high === undefined) {
        high = low;
        low = 0;
    }
    return floor(random(low, high));
}

/**
 * Draws a maze cell.
 */
function drawCell(cell: MazeCell, fillColor: string) {
    // makes positioning lines easier
    const top = cell.y * cellDisplayHeight;
    const bottom = (cell.y + 1) * cellDisplayHeight;
    const left = cell.x * cellDisplayWidth;
    const right = (cell.x + 1) * cellDisplayWidth;

    // draw background
    noStroke();
    fill(fillColor)
    rect(left, top, cellDisplayWidth, cellDisplayHeight);

    // draw walls - if a property is false, the cell is disconnected in that direction
    stroke("#000000");
    strokeWeight(4);
    if (!cell.up) {
        line(left, top, right, top);
    }
    if (!cell.down) {
        line(left, bottom, right, bottom);
    }
    if (!cell.left) {
        line(left, top, left, bottom);
    }
    if (!cell.right) {
        line(right, top, right, bottom);
    }
}

/**
 * Gets all unvisited cells that are adjacent to a cell's position.
 */
// function getAdjacentCells

// for disabling and reenabling keyboard input
let canvasHovered = true;

function setup() {
    // create the canvas
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // populate the grid
    for (let x = 0; x < MAZE_WIDTH; ++x) {
        const column: MazeCell[] = [];
        for (let y = 0; y < MAZE_HEIGHT; ++y) {
            column.push({
                x: x,
                y: y,
                up: false,
                down: false,
                left: false,
                right: false
            });
        }
        mazeGrid.push(column);
    }

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
    background(COLORS.BACKGROUND);

    noFill();

    // draw the maze
    for (let x = 0; x < MAZE_WIDTH; ++x) {
        for (let y = 0; y < MAZE_HEIGHT; ++y) {
            const cell = mazeGrid[x][y];

            drawCell(cell, COLORS.UNVISITED_CELL);
        }
    }
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