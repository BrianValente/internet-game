import _ from "lodash";
import { exit } from "process";
import { fileURLToPath } from "url";
import { drawGrid } from "./canvas";
import { Direction, CellStatus } from "./enums";
import { StartingGrid, Cell, Grid } from "./types";

const SIZE = 10;

/*
[
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
*/

const easyGrid: StartingGrid = {
    name: 'easyGrid',
    grid: [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    cell: { x: 0, y: 0 },
};

const impossibleGrid: StartingGrid = {
    name: 'impossibleGrid',
    grid:  [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    cell: { x: 0, y: 0 },
};

const discord: StartingGrid = {
    name: 'discord2',
    grid:  [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
        [0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
    ],
    cell: { x: 0, y: 0 },
};

const myGame: StartingGrid = {
    name: 'myGame',
    grid:  [
        [1, 0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    ],
    cell: { x: 0, y: 0 },
};

const startingData = myGame;

const getDirectionsAvailable = (grid: number[][], { x, y }: Cell): Direction[] => {
    const directions: Direction[] = [];
    if (y > 0 && grid[y - 1][x] === CellStatus.EMPTY) {
        directions.push(Direction.UP);
    }
    if (y < SIZE - 1 && grid[y + 1][x] === CellStatus.EMPTY) {
        directions.push(Direction.DOWN);
    }
    if (x > 0 && grid[y][x - 1] === CellStatus.EMPTY) {
        directions.push(Direction.LEFT);
    }
    if (x < SIZE - 1 && grid[y][x + 1] === CellStatus.EMPTY) {
        directions.push(Direction.RIGHT);
    }

    return directions;
};

let attempts = 0;
const attemptsToLog = 50000;
const maxAttemptsBeforeReset = attemptsToLog;

const isSolvable = (grid: Grid) => {
    const obstacles: Cell[] = [];

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (grid[y][x] === CellStatus.OBSTACLE) {
                obstacles.push({ x, y });
            }
        }
    }

    const oddCells = obstacles.filter(({ x, y }) => (x + y) % 2 !== 0);
    const evenCells = obstacles.filter(({ x, y }) => (x + y) % 2 === 0);

    return oddCells.length === 2 || evenCells.length === 2;
};

enum Sanity {
    OKAY, DISCONNECTED, SOLVED,
}
const checkSanity = (grid: Grid): Sanity => {
    // Check if any cell with a 1 can reach any other cell with a 1
    let emptyCells: Cell[] = [];

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (grid[y][x] === CellStatus.EMPTY) {
                emptyCells.push({ x, y });
            }
        }
    }

    let occurrences: Cell[] = [];

    const floodFill = (cell: Cell) => {
        if (
            cell.x >= SIZE
            || cell.y >= SIZE
            || cell.x < 0
            || cell.y < 0
            || grid[cell.y][cell.x] !== CellStatus.EMPTY
            || occurrences.find(occurrence => occurrence.x === cell.x && occurrence.y === cell.y)
        ) {
            return;
        }

        occurrences.push(cell);

        floodFill({ x: cell.x, y: cell.y + 1 });
        floodFill({ x: cell.x, y: cell.y - 1 });
        floodFill({ x: cell.x - 1, y: cell.y });
        floodFill({ x: cell.x + 1, y: cell.y });
    }

    if (solvable && emptyCells.length === 0) return Sanity.SOLVED;
    if (!solvable && emptyCells.length < 4) return Sanity.SOLVED;

    floodFill(emptyCells[0]);
    return emptyCells.length !== occurrences.length ? Sanity.DISCONNECTED : Sanity.OKAY;
}

let reset = false;
const solvable = isSolvable(startingData.grid)

const main = (grid: Grid, steps: Direction[], position: Cell, firstRun: boolean = false) => {
    const handleDeadEnd = () => {
        attempts++;
        // if (attempts % attemptsToLog === 0) console.log({ attempts });
        if (maxAttemptsBeforeReset < attempts) reset = true;
    }

    const sanity = checkSanity(grid);
    switch (sanity) {
        case Sanity.SOLVED:
            console.log('\u0007SOLVED', steps);
            drawGrid(startingData.name, grid, steps, startingData.cell);
            exit(0);
        case Sanity.DISCONNECTED:
            handleDeadEnd();
            return;
    }

    const directions = _.shuffle(getDirectionsAvailable(grid, position));

    if (directions.length === 0) {
        console.log('DA FUQ');
        handleDeadEnd();
        return;
    }

    for (let direction of directions) {
        if (reset) return;

        const newGrid = _.cloneDeep(grid);
        const newSteps = _.cloneDeep(steps);
        let newX = position.x;
        let newY = position.y;

        switch (direction) {
            case Direction.UP:
                newY--;
                break;
            case Direction.DOWN:
                newY++;
                break;
            case Direction.LEFT:
                newX--;
                break;
            case Direction.RIGHT:
                newX++;
                break;
        }

        if (newGrid[newY][newX] === CellStatus.FILLED) throw new Error(JSON.stringify({ message: 'FILLED', grid, newX, newY}));
        newGrid[newY][newX] = CellStatus.FILLED;
        newSteps.push(direction);
        
        main(newGrid, newSteps, { x: newX, y: newY });
    }
}

drawGrid(startingData.name, startingData.grid, [], startingData.cell);


console.log(`Starting grid: ${startingData.name}`);
if (!solvable) console.error('Unsolvable grid, trying my best');

do {
    reset = false;
    main(startingData.grid, [], startingData.cell, false);
    attempts = 0;
} while (reset);

export {};
