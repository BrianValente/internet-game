import { CellStatus, Direction } from "../enums";
import { data } from "..";
import { Cell } from "../types";

export const getDirectionsAvailable = (grid: number[][], { x, y }: Cell): Direction[] => {
    const directions: Direction[] = [];
    if (y > 0 && grid[y - 1][x] === CellStatus.EMPTY) {
        directions.push(Direction.UP);
    }
    if (y < data.config.startingData.size - 1 && grid[y + 1][x] === CellStatus.EMPTY) {
        directions.push(Direction.DOWN);
    }
    if (x > 0 && grid[y][x - 1] === CellStatus.EMPTY) {
        directions.push(Direction.LEFT);
    }
    if (x < data.config.startingData.size - 1 && grid[y][x + 1] === CellStatus.EMPTY) {
        directions.push(Direction.RIGHT);
    }

    return directions;
};