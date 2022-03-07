import _ from "lodash";
import { drawGrid } from "./canvas";
import { Direction, GridStatus, CellStatus } from "./enums";
import { data } from ".";
import { Grid, Cell } from "./types";
import { getDirectionsAvailable } from "./utils/getDirectionsAvailable";
import { getGridStatus } from "./utils/getGridStatus";
import { getCursor } from "./utils/getCursor";

export const mainLoop = (
    grid: Grid,
    steps: Direction[],
    position: Cell,
) => {
    // if (steps.length > data.image.level && data.image.lastCreatedAt < Date.now() - 1000) {
    //     drawGrid(data.config.startingData.name, grid, steps, data.config.startingData.cell);
    //     data.image.lastCreatedAt = Date.now();
    //     data.image.level = steps.length;
    // }

    const handleDeadEnd = () => {
        data.attempts++;
        if (data.attempts % data.config.attemptsToLog === 0) {
            console.log({ attempts: data.attempts });
        }
        if (data.config.maxAttemptsBeforeReset < data.attempts) {
            data.shouldReset = true;
        }
    }

    const sanity = getGridStatus(grid, position);
    switch (sanity) {
        case GridStatus.SOLVED:
            grid[position.y][position.x] = CellStatus.CURSOR;
            console.log('\u0007SOLVED\n', JSON.stringify(steps), '\n');
            const path = drawGrid(data.config.startingData.name, grid, steps, getCursor(data.config.startingData.grid));
            console.log(`Image saved: ${path}`);
            process.exit(0);
        case GridStatus.DISCONNECTED:
        case GridStatus.TRAPPED:
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
        if (data.shouldReset) return;

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
        
        mainLoop(newGrid, newSteps, { x: newX, y: newY });
    }
}