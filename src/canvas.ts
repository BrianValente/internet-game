import canvasLib from "canvas";
import fs from "fs";
import { CellStatus, Direction } from "./enums";
import { Cell, Grid } from "./types";

const SQUARE_SIZE = 20;
const SQUARE_MARGIN = 2;

const WIDTH = (SQUARE_MARGIN + SQUARE_SIZE) * 10 + SQUARE_MARGIN;
const HEIGHT = WIDTH;

const SquareColor: { [key in CellStatus]: string } = {
    [CellStatus.EMPTY]: '#33cc33',
    [CellStatus.FILLED]: '#8423ff',
    [CellStatus.OBSTACLE]: '#404040',
};

const getSquareCoords = (cell: Cell) => ({
    x: cell.x * SQUARE_SIZE + (cell.x + 1) * SQUARE_MARGIN,
    y: cell.y * SQUARE_SIZE + (cell.y + 1) * SQUARE_MARGIN,
})

const drawSquare = (context: canvasLib.CanvasRenderingContext2D, x: number, y: number, color: string) => {
    context.fillStyle = color;
    const coords = getSquareCoords({ x, y });
    context.fillRect(
        coords.x,
        coords.y,
        SQUARE_SIZE,
        SQUARE_SIZE,
    );
};

const drawSquares = (context: canvasLib.CanvasRenderingContext2D, grid: Grid) => {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            drawSquare(context, x, y, SquareColor[grid[y][x]]);
        }
    }
};

const drawArrow = (context: canvasLib.CanvasRenderingContext2D, from: Cell, to: Cell) => {
    context.fillStyle = '#fafafa';
    context.lineWidth = 2;
    context.beginPath();
    const fromSquareCoords = getSquareCoords(from);
    const toSquareCoords = getSquareCoords(to);
    context.moveTo(
        fromSquareCoords.x + SQUARE_SIZE / 2,
        fromSquareCoords.y + SQUARE_SIZE / 2,
    );
    context.lineTo(
        toSquareCoords.x + SQUARE_SIZE / 2,
        toSquareCoords.y + SQUARE_SIZE / 2,
    );
    context.stroke();
};

const drawArrows = (
    context: canvasLib.CanvasRenderingContext2D,
    steps: Direction[],
    startCell: Cell,
) => {
    let currentCell = startCell;
    for (let direction of steps) {
        let newX = currentCell.x;
        let newY = currentCell.y;

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

        const nextCell = { x: newX, y: newY };
        drawArrow(context, currentCell, nextCell);
        currentCell = nextCell;
    }
};

export const drawGrid = (name: string, grid: Grid, steps: Direction[], startCell: Cell) => {
    const canvas = canvasLib.createCanvas(WIDTH, HEIGHT);
    const context = canvas.getContext("2d");

    context.fillStyle = '#222';
    context.fillRect(0, 0, WIDTH, HEIGHT);

    drawSquares(context, grid);
    drawArrows(context, steps, startCell);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`./output/${name}.png`, buffer);
}