// constants
const CANVAS_WIDTH: number = 800;
const CANVAS_HEIGHT: number = 800;
const MAZE_WIDTH: number = 20;
const MAZE_HEIGHT: number = 20;

/**
 * Delay between generator steps, in frames.
 */
const STEP_DELAY: number = 1;

const COLORS = {
    BACKGROUND: "#808080",
    CELL_WALLS: "#000000",
    UNVISITED_CELL: "#a0a0a0",
    VISITED_CELL: "#ffffff",
    PATH_CELL: "#ed4545",
    HEAD_CELL: "#52f75d"
};


// typescript stuff
type pair<T> = [key1:T, key2:T];
/** A single cell in the maze. */
interface MazeCell {
    /** Whether the cell connects to the cell above it. */
    up: boolean,
    /** Whether the cell connects to the cell below it. */
    down: boolean,
    /** Whether the cell connects to the cell to the left of it. */
    left: boolean,
    /** Whether the cell connects to the cell to the right of it. */
    right: boolean
};


/** How wide each cell appears when displayed, in pixels. */
const cellDisplayWidth = CANVAS_WIDTH / MAZE_WIDTH;
/** How tall each cell appears when displayed, in pixels. */
const cellDisplayHeight = CANVAS_HEIGHT / MAZE_HEIGHT;

/** All cells in the maze. */
const mazeGrid: MazeCell[][] = [];

/** The coordinates of cells that have been visited at some point. */
const visitedCells: pair<number>[] = [];

/** The coordinates of  cells in the current path. */
const cellPath: pair<number>[] = [];

let mazeGenerated: boolean = false;

// for disabling and reenabling keyboard input
let canvasHovered = true;

// for timing generator steps
let remainingDelay = STEP_DELAY;

let paused: boolean = true;

/**
 * Returns whether an array of pairs contains a pair.
 */
function arrayContainsPair<T>(array: pair<T>[], pair: pair<T>): boolean {
    for (const item of array) {
        if (item[0] === pair[0] && item[1] === pair[1]) {
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
function drawCell(cell: MazeCell, x: number, y: number, fillColor: string) {
    // makes positioning lines easier
    const top = y * cellDisplayHeight;
    const bottom = (y + 1) * cellDisplayHeight;
    const left = x * cellDisplayWidth;
    const right = (x + 1) * cellDisplayWidth;

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
 * Gets the coordinates of all unvisited cells that are adjacent to another cell's coordinates.
 */
function getAdjacentCells(pos: pair<number>): pair<number>[] {
    const x = pos[0], y = pos[1];

    const coords: pair<number>[] = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
    ];

    const adjacentCells: pair<number>[] = [];

    for (const coord of coords) {
        // make sure the cell is in bounds and not already visited
        if (coord[0] >= 0 && coord[0] < MAZE_WIDTH && coord[1] >= 0 && coord[1] < MAZE_HEIGHT &&
            !arrayContainsPair(visitedCells, coord)
        ) {
            adjacentCells.push(coord);
        }
    }

    return adjacentCells;
}

/**
 * Runs a single step of the generator.
 */
function stepGenerator() {
    // grab the coordinates of the head cell
    const currentHead: pair<number> = cellPath[cellPath.length - 1];

    // find which cells we can carve into
    const adjacentCells = getAdjacentCells(currentHead);

    // if we're add a dead end, remove the head to step back a cell
    if (adjacentCells.length === 0) {
        cellPath.pop();

        // if we've made it all the way back to the start of the path, the maze is fully generated
        if (cellPath.length === 0) {
            mazeGenerated = true;
        }
    }
    // otherwise, carve into a new cell
    else {
        const newHead = adjacentCells[randInt(adjacentCells.length)];

        // mark the new head as visited and add it to the path
        visitedCells.push(newHead);
        cellPath.push(newHead);

        // update the display
        const currentHeadDisplay = mazeGrid[currentHead[0]][currentHead[1]];
        const newHeadDisplay = mazeGrid[newHead[0]][newHead[1]];

        // carve up
        if (newHead[1] < currentHead[1]) {
            currentHeadDisplay.up = true;
            newHeadDisplay.down = true;
        }
        // carve down
        else if (newHead[1] > currentHead[1]) {
            currentHeadDisplay.down = true;
            newHeadDisplay.up = true;
        }
        // carve left
        else if (newHead[0] < currentHead[0]) {
            currentHeadDisplay.left = true;
            newHeadDisplay.right = true;
        }
        // carve right
        else {
            currentHeadDisplay.right = true;
            newHeadDisplay.left = true;
        }
    }
}

function setup() {
    // create the canvas and add a tiny margin for border thickness
    const canvas = createCanvas(CANVAS_WIDTH + 4, CANVAS_HEIGHT + 4);

    // populate the grid
    for (let x = 0; x < MAZE_WIDTH; ++x) {
        const column: MazeCell[] = [];
        for (let y = 0; y < MAZE_HEIGHT; ++y) {
            column.push({
                up: false,
                down: false,
                left: false,
                right: false
            });
        }
        mazeGrid.push(column);
    }

    // start with a random cell
    const startCell: pair<number> = [randInt(MAZE_WIDTH), randInt(MAZE_HEIGHT)];
    cellPath.push(startCell);
    visitedCells.push(startCell);

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

    // why is this just named push()???? was there nothing more descriptive????
    push();
    // offset so the borders are the correct thickness
    translate(2, 2);

    // draw the maze
    for (let x = 0; x < MAZE_WIDTH; ++x) {
        for (let y = 0; y < MAZE_HEIGHT; ++y) {
            const cell = mazeGrid[x][y];

            // find the correct color to use
            let cellColor;
            if (arrayContainsPair(cellPath, [x, y])) {
                const head = cellPath[cellPath.length - 1];

                if (head[0] === x && head[1] === y) {
                    cellColor = COLORS.HEAD_CELL;
                }
                else {
                    cellColor = COLORS.PATH_CELL;
                }
            }
            else if (arrayContainsPair(visitedCells, [x, y])) {
                cellColor = COLORS.VISITED_CELL;
            }
            else {
                cellColor = COLORS.UNVISITED_CELL;
            }

            drawCell(cell, x, y, cellColor);
        }
    }

    pop();

    // keep generating the maze
    if (!mazeGenerated && !paused) {
        --remainingDelay;
        if (remainingDelay === 0) {
            remainingDelay = STEP_DELAY;
            stepGenerator();
        }
    }
}

function _mousePressed() {
    paused = !paused;
    remainingDelay = STEP_DELAY;
}

function _mouseReleased() {
    // console.log(`pressed ${mouseButton}`);
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