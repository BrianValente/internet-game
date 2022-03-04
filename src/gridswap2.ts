import _ from "lodash";
import { exit } from "process";
import { fileURLToPath } from "url";

const SIZE = 10;

enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
};

enum CellStatus {
    EMPTY = 0,
    FILLED = 1,
}

type Grid = number[][];
type Cell = { x: number; y: number };
type StartingGrid = {
    grid: Grid;
    cell: Cell;
}

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

const knownSolvableGrid: StartingGrid = {
    grid: [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    cell: { x: 0, y: 0 },
};

// https://discord.com/channels/900766208939405334/908484444455854080/949435593413230632
const discordGrid: StartingGrid = {
    grid: [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    cell: { x: 0, y: 0 },
};

// arranca en 3, 6
const padreGrid: StartingGrid = {
    grid:  [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 1, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    cell: { x: 3, y: 6 },
};

const filename = fileURLToPath(import.meta.url);

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

    if (emptyCells.length === 0) return Sanity.SOLVED;
    floodFill(emptyCells[0]);
    return emptyCells.length !== occurrences.length ? Sanity.DISCONNECTED : Sanity.OKAY;
}

let reset = false;
const maxTimePerNode = 1000;

const main = (grid: Grid, steps: Direction[], position: Cell, firstRun: boolean = false) => {
    // const startTime = Date.now();
    // const level = steps.length;

    const handleDeadEnd = () => {
        attempts++;
        // if (attempts % attemptsToLog === 0) console.log({ attempts });
        if (maxAttemptsBeforeReset < attempts) reset = true;
    }

    const sanity = checkSanity(grid);
    switch (sanity) {
        case Sanity.SOLVED:
            console.log('SOLVED', steps);
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

    // const endTime = Date.now() - startTime;
    // if (endTime > 500) console.log({ level, endTime });
}


do {
    reset = false;
    main(knownSolvableGrid.grid, [], knownSolvableGrid.cell, false);
    attempts = 0;
} while (reset);

export {};
