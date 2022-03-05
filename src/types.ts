import type { CellStatus } from "./enums";

export type Grid = CellStatus[][];
export type Cell = { x: number; y: number };
export type StartingGrid = {
    name: string;
    grid: Grid;
    cell: Cell;
};
