import _ from "lodash";
import { drawGrid } from "./canvas";
import { CellStatus } from "./enums";
import * as Grids from "./grids";
import { mainLoop } from "./mainLoop";
import { getCursor } from "./utils/getCursor";
import { isSolvable } from "./utils/isSolvable";

// Configuration
const config = {
    startingData: Grids.grid,
    attemptsToLog: Infinity,
    maxAttemptsBeforeReset: 1000,
}

export const data = {
    config,
    attempts: 0,
    shouldReset: false,
    solvable: false,
    image: {
        lastCreatedAt: 0,
        level: 0,
    }
};

data.solvable = isSolvable(config.startingData.grid);

const main = () => {
    console.log(`Starting grid: ${config.startingData.name}`);
    if (!data.solvable) console.error('Unsolvable grid, trying my best');

    const cursor = getCursor(config.startingData.grid);
    const grid = _.cloneDeep(config.startingData.grid);
    drawGrid(config.startingData.name, grid, [], cursor);
    grid[cursor.y][cursor.x] = CellStatus.FILLED;

    do {
        data.attempts = 0;
        data.shouldReset = false;
        mainLoop(grid, [], cursor);
    } while (data.shouldReset);
};

main();

export {};
