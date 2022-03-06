import { CellStatus } from "../enums";
import { Cell, Grid } from "../types";

export const getCursor = (grid: Grid): Cell => {
    const cursor = { x: 0, y: 0 };
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === CellStatus.CURSOR) {
                cursor.x = x;
                cursor.y = y;
                return cursor;
            }
        }
    }
    return cursor;
};
