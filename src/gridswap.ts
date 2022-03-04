import _ from "lodash";
import { exit } from "process";

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

const startingGrid: Grid = [
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
];

const getDirectionsAvailable = (grid: number[][], x: number, y: number): Direction[] => {
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

const thereAreEmptyCells = (grid: number[][]): boolean => {
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (grid[y][x] === CellStatus.EMPTY) {
                return true;
            }
        }
    }
    return false;
};

const attemps: Direction[][] = [];

const main = (grid: Grid, steps: Direction[], x: number, y: number) => {
    const directions: Direction[] = getDirectionsAvailable(grid, x, y);

    if (y > SIZE) exit(0)

    if (directions.length === 0) {
        if (!thereAreEmptyCells(startingGrid)) {
            console.log('RESOLVED!!', steps);
            exit(0);
        } else {
            console.log('dead end', x, y);
            if (attemps.some((a) => _.isEqual(a, steps))) {
                throw new Error('duplicated attempt');
            }
            attemps.push(steps);
            return;
        }
    }

    for(let direction of directions) {
        const newGrid = _.cloneDeep(grid);
        const newSteps = _.cloneDeep(steps);
        let newX = x;
        let newY = y;

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

        newGrid[newY][newX] = CellStatus.FILLED;
        newSteps.push(direction);
        main(newGrid, newSteps, newX, newY);
    }
}

main(startingGrid, [], 0, 0);

export {};
