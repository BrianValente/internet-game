import canvasLib from "canvas";
import fs from "fs";
import tinycolor from "tinycolor2";
import { data } from ".";
import { CellStatus, Direction } from "./enums";
import { Cell, Grid } from "./types";

const SQUARE_SIZE = 80;
const SQUARE_MARGIN = 10;
const SQUARE_RADIUS = 20;
const SQUARES_MARGIN = 40;
const IMAGE_MARGIN = 40;

const getImageSize = (gridSize: number) => {
    const width = (
        (SQUARE_MARGIN + SQUARE_SIZE) * gridSize
        + SQUARE_MARGIN
        + (SQUARES_MARGIN * 2)
        + (IMAGE_MARGIN * 2)
    );
    const height = width;

    return { width, height };
}

const SquareColor: { [key in CellStatus]: string } = {
    [CellStatus.EMPTY]: '#33cc33',
    [CellStatus.FILLED]: '#8423ff',
    [CellStatus.OBSTACLE]: '#505050',
    [CellStatus.CURSOR]: '#ffffff',
};

const getSquareCoords = (cell: Cell) => ({
    x: cell.x * SQUARE_SIZE + (cell.x + 1) * SQUARE_MARGIN + SQUARES_MARGIN + IMAGE_MARGIN,
    y: cell.y * SQUARE_SIZE + (cell.y + 1) * SQUARE_MARGIN + SQUARES_MARGIN + IMAGE_MARGIN,
})

const drawRoundedRect = (context: canvasLib.CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, radius: number) => {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
    context.fill();
};

const drawCell = (context: canvasLib.CanvasRenderingContext2D, x: number, y: number, color: string) => {
    const coords = getSquareCoords({ x, y });
    drawRoundedRect(context, coords.x, coords.y, SQUARE_SIZE, SQUARE_SIZE, color, SQUARE_RADIUS);
};

const drawCells = (context: canvasLib.CanvasRenderingContext2D, grid: Grid, size: number) => {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const isOdd = (x + y) % 2 !== 0;
            const tColor = tinycolor(SquareColor[grid[y][x]]);
            const color = isOdd || grid[y][x] === CellStatus.CURSOR
                ? tColor.toHex8String()
                : tColor.darken(10).toHex8String();
            const shadowColor = tColor.getLuminance() > 0.8
                ? tColor.darken(20).setAlpha(0.8).toHex8String()
                : tColor.setAlpha(0.8).toHex8String();
            context.shadowColor = shadowColor;
            context.shadowBlur = 10;
            context.shadowOffsetY = 5;
            drawCell(context, x, y, color);
        }
    }
};

const drawArrows = (
    context: canvasLib.CanvasRenderingContext2D,
    steps: Direction[],
    startCell: Cell,
) => {
    let currentCell = startCell;
    let to = getSquareCoords(currentCell);
    context.strokeStyle = '#fafafa';
    context.lineWidth = 14;
    context.shadowColor = '#fafafa';
    context.shadowBlur = 10;
    context.shadowOffsetY = 0;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(
        to.x + SQUARE_SIZE / 2,
        to.y + SQUARE_SIZE / 2,
    );

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

        currentCell = { x: newX, y: newY };
        to = getSquareCoords(currentCell);
        context.lineTo(
            to.x + SQUARE_SIZE / 2,
            to.y + SQUARE_SIZE / 2,
        );
    }

    context.stroke();
};

export const drawGrid = (name: string, grid: Grid, steps: Direction[], startCell: Cell) => {
    const gridSize = data.config.startingData.size;
    const { width, height } = getImageSize(gridSize);
    const canvas = canvasLib.createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Background
    context.shadowColor = '#202020';
    context.shadowBlur = 10;
    context.shadowOffsetY = 10;
    drawRoundedRect(
        context,
        IMAGE_MARGIN,
        IMAGE_MARGIN,
        width - (IMAGE_MARGIN * 2),
        height - (IMAGE_MARGIN * 2),
        '#fcfcfc',
        40,
    )

    drawCells(context, grid, gridSize);
    drawArrows(context, steps, startCell);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`./output/${name}.png`, buffer);
}