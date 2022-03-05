import canvasLib from "canvas";
import fs from "fs";
import tinycolor from "tinycolor2";
import { CellStatus, Direction } from "./enums";
import { Cell, Grid } from "./types";

const SQUARE_SIZE = 50;
const SQUARE_MARGIN = 5;
const SQUARE_RADIUS = 10;

const WIDTH = (SQUARE_MARGIN + SQUARE_SIZE) * 10 + SQUARE_MARGIN;
const HEIGHT = WIDTH;

const SquareColor: { [key in CellStatus]: string } = {
    [CellStatus.EMPTY]: '#33cc33',
    [CellStatus.FILLED]: '#8423ff',
    [CellStatus.OBSTACLE]: '#505050',
};

const getSquareCoords = (cell: Cell) => ({
    x: cell.x * SQUARE_SIZE + (cell.x + 1) * SQUARE_MARGIN,
    y: cell.y * SQUARE_SIZE + (cell.y + 1) * SQUARE_MARGIN,
})

const drawSquare = (context: canvasLib.CanvasRenderingContext2D, x: number, y: number, color: string) => {
    context.fillStyle = color;
    const coords = getSquareCoords({ x, y });
    context.beginPath();
    context.moveTo(coords.x + SQUARE_RADIUS, coords.y);
    context.arcTo(coords.x + SQUARE_SIZE, coords.y, coords.x + SQUARE_SIZE, coords.y + SQUARE_SIZE, SQUARE_RADIUS);
    context.arcTo(coords.x + SQUARE_SIZE, coords.y + SQUARE_SIZE, coords.x, coords.y + SQUARE_SIZE, SQUARE_RADIUS);
    context.arcTo(coords.x, coords.y + SQUARE_SIZE, coords.x, coords.y, SQUARE_RADIUS);
    context.arcTo(coords.x, coords.y, coords.x + SQUARE_SIZE, coords.y, SQUARE_RADIUS);
    context.closePath();
    context.fill();
};

const drawSquares = (context: canvasLib.CanvasRenderingContext2D, grid: Grid) => {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const isOdd = (x + y) % 2 !== 0;
            const tColor = tinycolor(SquareColor[grid[y][x]]);
            const color = isOdd
                ? tColor.toHex8String()
                : tColor.darken(10).toHex8String();
            drawSquare(context, x, y, color);
        }
    }
};

const drawArrow = (context: canvasLib.CanvasRenderingContext2D, from: Cell, to: Cell) => {
    context.fillStyle = '#fafafa';
    context.lineWidth = 6;
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

    // context.fillStyle = '#222';
    // context.fillRect(0, 0, WIDTH, HEIGHT);

    drawSquares(context, grid);
    drawArrows(context, steps, startCell);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`./output/${name}.png`, buffer);
}