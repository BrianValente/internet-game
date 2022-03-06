import { GridStatus, CellStatus } from "../enums";
import { data } from "..";
import { Grid, Cell } from "../types";

const areNeighbours = (cell1: Cell, cell2: Cell) => {
    return (
        Math.abs(cell1.x - cell2.x) === 1
        || Math.abs(cell1.y - cell2.y) === 1
    );
}

export const getGridStatus = (grid: Grid, position: Cell): GridStatus => {
    // Check if any cell with a 1 can reach any other cell with a 1
    let emptyCells: Cell[] = [];

    for (let y = 0; y < data.config.startingData.size; y++) {
        for (let x = 0; x < data.config.startingData.size; x++) {
            if (grid[y][x] === CellStatus.EMPTY) {
                emptyCells.push({ x, y });
            }
        }
    }

    let occurrences: Cell[] = [];

    const floodFill = (cell: Cell) => {
        if (
            cell.x >= data.config.startingData.size
            || cell.y >= data.config.startingData.size
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

    if (data.solvable && emptyCells.length === 0) return GridStatus.SOLVED;
    if (!data.solvable && emptyCells.length < 3) return GridStatus.SOLVED;

    const isTrapped = (cell: Cell) => {
        if (areNeighbours(cell, position)) return false;

        const up = grid[cell.y-1]?.[cell.x];
        const down = grid[cell.y+1]?.[cell.x];
        const left = grid[cell.y]?.[cell.x-1];
        const right = grid[cell.y]?.[cell.x+1];

        let counter = 0;

        [up, down, left, right].forEach((neighbour) => {
            if (neighbour !== CellStatus.EMPTY) {
                counter++;
            }
        });

        return counter > 2;
    };

    let oneTrapped = false;

    for (let cell of emptyCells) {
        if (isTrapped(cell)) {
            if (oneTrapped) return GridStatus.TRAPPED;
            oneTrapped = true;
        }
    }

    floodFill(emptyCells[0]);
    return emptyCells.length !== occurrences.length ? GridStatus.DISCONNECTED : GridStatus.OKAY;
}