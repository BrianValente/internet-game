import { CellStatus } from "../enums";
import { data } from "..";
import { Grid, Cell } from "../types";

export const isSolvable = (grid: Grid) => {
    const obstacles: Cell[] = [];

    for (let y = 0; y < data.config.startingData.size; y++) {
        for (let x = 0; x < data.config.startingData.size; x++) {
            if (grid[y][x] === CellStatus.OBSTACLE) {
                obstacles.push({ x, y });
            }
        }
    }

    const oddCells = obstacles.filter(({ x, y }) => (x + y) % 2 !== 0);
    const evenCells = obstacles.filter(({ x, y }) => (x + y) % 2 === 0);

    return oddCells.length / evenCells.length === 1;
};