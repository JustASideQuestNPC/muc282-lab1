// constants
const CANVAS_WIDTH: number = 600;
const CANVAS_HEIGHT: number = 600;
const MAZE_WIDTH: number = 15;
const MAZE_HEIGHT: number = 15;

/**
 * Delay between generator steps, in frames.
 */
const STEP_DELAY: number = 1;

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

// buttons
let resetButton: p5.Element;
let pauseButton: p5.Element;
let stepButton: p5.Element;
let watchButton: p5.Element;

/**
 * Generates a maze using Recursive Backtracking.
 */
class Maze {
    /** All cells in the maze. */
    #cellGrid: MazeCell[][];

    /** Coordinates of all cells that have been visited at some point. */
    #visitedCells: pair<number>[] = [];

    /** Coordinates of all cells in the path. */
    #cellPath: pair<number>[] = [];

    /** Width of the maze in cells */
    #width: number;

    /** Height of the maze in cells. */
    #height: number;

    /** How wide each cell appeats when drawn. */
    #displayWidth: number;

    /** How tall each cell appears when drawn. */
    #displayHeight: number

    /** Whether the maze is fully generated. */
    #generated: boolean;

    /** Whether the generator can be re-paused during watch mode. */
    #hasWatched: boolean = false;

    /** Whether generation is paused. Does nothing if the maze is already generated. */
    paused: boolean = true;

    /** If true, the maze will pause each time the generator hits a dead end. */
    watchMode: boolean = false;

    constructor(mazeWidth: number, mazeHeight: number, displayWidth: number,
                displayHeight: number) {
        this.#width = mazeWidth;
        this.#height = mazeHeight;
        this.#displayWidth = displayWidth;
        this.#displayHeight = displayHeight;
        this.reset();
    }

    /**
     * Resets the generator to an empty maze.
     */
    reset() {
        // remove existing data
        this.#generated = false;
        this.#cellGrid = [];
        this.#visitedCells = [];
        this.#cellPath = [];
        this.#hasWatched = false;

        // populate the grid with disconnected cells
        for (let x = 0; x < this.#width; ++x) {
            let column: MazeCell[] = [];
            for (let y = 0; y < this.#height; ++y) {
                column.push({
                    up: false,
                    down: false,
                    left: false,
                    right: false
                });
            }
            this.#cellGrid.push(column);
        }

        // start with a random cell
        const startCell: pair<number> = [randInt(this.#width), randInt(this.#height)];
        this.#cellPath.push(startCell);
        this.#visitedCells.push(startCell);
    }

    /**
     * Steps the generator a single time.
     */
    stepGenerator(ignorePause: boolean=false) {
        // do nothing if the maze is generated or if generation is paused
        if (this.#generated || (this.paused && !ignorePause)) { return; }

        // grab the coordinates of the head (end of the path)
        const currentHead = this.#cellPath[this.#cellPath.length - 1];

        // find which cells we can carve into, if any
        const x = currentHead[0], y = currentHead[1];

        const adjacentCoords: pair<number>[] = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1]
        ];
    
        const adjacentCells: pair<number>[] = [];

        for (const cell of adjacentCoords) {
            // make sure the cell is in bounds and unvisited
            if (cell[0] >= 0 && cell[0] < this.#width && cell[1] >= 0 && cell[1] < this.#height &&
                !arrayContainsPair(this.#visitedCells, cell)
            ) {
                adjacentCells.push(cell);
            }
        }

        // if we can't carve into any cells, remove the head and step back a cell
        if (adjacentCells.length === 0) {
            // watch mode stops the generator whenever it hits a dead end
            if (this.watchMode && !this.#hasWatched) {
                this.paused = true;
                pauseButton.html("Unpause");

                // prevent us from pausing again until we've carved at least 1 new cell
                this.#hasWatched = true;

                // end before stepping backward so the animation looks a little better
                return;
            }

            this.#cellPath.pop();
            // once we get all the way back to the starting cell, the maze is generated
            if (this.#cellPath.length === 0) {
                this.#generated = true;
            }
        }
    // otherwise, carve into a new cell
    else {
        // update whether watch mode can pause again
        this.#hasWatched = false;

        const newHead = adjacentCells[randInt(adjacentCells.length)];

        // mark the new head as visited and add it to the path
        this.#visitedCells.push(newHead);
        this.#cellPath.push(newHead);

        // update the display
        const currentHeadDisplay = this.#cellGrid[currentHead[0]][currentHead[1]];
        const newHeadDisplay = this.#cellGrid[newHead[0]][newHead[1]];

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

    /** Draws the entire maze. */
    render() {
        // why is this just named push()???? was there nothing more descriptive????
        push();
        // offset so the borders are the correct thickness
        translate(2, 2);

        for (let x = 0; x < this.#cellGrid.length; ++x) {
            for (let y = 0; y < this.#cellGrid[x].length; ++y) {
                const cell = this.#cellGrid[x][y];
        
                // makes positioning lines easier
                const top = y * this.#displayHeight;
                const bottom = (y + 1) * this.#displayHeight;
                const left = x * this.#displayWidth;
                const right = (x + 1) * this.#displayWidth;

                // get the correct color
                let fillColor: string;
                let coords: pair<number> = [x, y];
                if (arrayContainsPair(this.#cellPath, coords)) {
                    const head = this.#cellPath[this.#cellPath.length - 1];
                    if (head[0] === x && head[1] === y) {
                        fillColor = "#52f75d";
                    }
                    else {
                        fillColor = "#ed4545";
                    }
                }
                else if (arrayContainsPair(this.#visitedCells, coords)) {
                    fillColor = "#ffffff";
                }
                else {
                    fillColor = "#a0a0a0";
                }

                // draw cell background
                noStroke();
                fill(fillColor)
                rect(left, top, this.#displayWidth, this.#displayHeight);


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
        }

        pop();
    }

    // getters
    /** The width of the maze, in cells. */
    get width() { return this.#width; }
    /** The height of the maze, in cells. */
    get height() { return this.#height; }
    /** How wide each cell appears when drawn, in pixels. */
    get displayWidth() { return this.#displayWidth; }
    /** How tall each cell appears when drawn, in pixels. */
    get displayHeight() { return this.#displayHeight; }
    /** Whether the maze is fully generated. */
    get generated() { return this.#generated; }
}

// the maze generator
let maze: Maze;

// for disabling and reenabling keyboard input
let canvasHovered = true;

function setup() {
    // create the canvas and add a tiny margin for border thickness
    const canvas = createCanvas(CANVAS_WIDTH + 4, CANVAS_HEIGHT + 4);

    maze = new Maze(MAZE_WIDTH, MAZE_HEIGHT, cellDisplayWidth, cellDisplayHeight);

    // create all the interface buttons
    resetButton = createButton("reset")
                 .html("Reset")
                 .size(100, 50)
                 .style("text-align", "center")
                 .style("font-size", "20px");
    resetButton.mouseClicked(() => {
        maze.reset();
        maze.paused = true;
        pauseButton.html("Unpause");
    });

    pauseButton = createButton("toggle pause")
                 .html("Unpause")
                 .size(100, 50)
                 .style("text-align", "center")
                 .style("font-size", "20px");
    pauseButton.mouseClicked(() => {
        maze.paused = !maze.paused;
        if (maze.paused) {
            pauseButton.html("Unpause");
        }
        else {
            pauseButton.html("Pause");
        }
    });

    stepButton = createButton("step")
                .html("Step")
                .size(100, 50)
                .style("text-align", "center")
                .style("font-size", "20px");
    stepButton.mouseClicked(() => {
        if (maze.paused) {
            maze.stepGenerator(true);
        }
    });

    watchButton = createButton("toggle watch")
                 .html("Watch Mode Disabled")
                 .size(225, 50)
                 .style("text-align", "center")
                 .style("font-size", "20px");
    watchButton.mouseClicked(() => {
        maze.watchMode = !maze.watchMode;
        if (maze.watchMode) {
            watchButton.html("Watch Mode Enabled");
        }
        else {
            watchButton.html("Watch Mode Disabled");
        }
    });

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

    canvas.parent("sketchContainer");
}

function draw() {
    maze.stepGenerator();

    background("#808080");

    maze.render();
}

function _mousePressed() {

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