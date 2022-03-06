export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
};

export enum CellStatus {
    EMPTY = 0,
    FILLED = 1,
    OBSTACLE = 2,
    CURSOR = 3,
}

export enum GridStatus {
    OKAY = 'okay',
    DISCONNECTED = 'disconnected',
    TRAPPED = 'trapped',
    SOLVED = 'solved',
}
