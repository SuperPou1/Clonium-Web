export const MAX_WIDTH = 12;
export const MAX_HEIGHT = 12;
const INITIAL_BOARD = Array(MAX_HEIGHT).fill(Array(MAX_WIDTH).fill(false));

function initialBoard(width:number,height:number){
  return Array(height).fill(Array(width).fill(false))
}
export function RectangularLayout(width: number, height: number): boolean[][] {
  if (width <= 0 || width > MAX_WIDTH) {
    throw new RangeError(`Width must be between 1 and ${MAX_WIDTH} inclusive`);
  }
  if (height <= 0 || height > MAX_HEIGHT) {
    throw new RangeError(`Height must be between 1 and ${MAX_HEIGHT} inclusive`);
  }

  let offset_x = 0;//Math.floor((width - width) / 2);
  let offset_y = 0;//Math.floor((height - height) / 2);

  return initialBoard(width,height).map((row, y) => row.map((cell, x) => {

    if (x < offset_x || y < offset_y || (x - offset_x) >= width || (y - offset_y) >= height) {
      return false;
    } else {
      return true;
    }

  }));
}

export function TwoRectangulesLayout(w1: number, h1: number, w2: number, h2: number): boolean[][] {
  if (w1 <= 0 || w1 > MAX_WIDTH) {
    throw new RangeError(`Width must be between 1 and ${MAX_WIDTH} inclusive`);
  }
  if (h1 <= 0 || h2 > MAX_HEIGHT) {
    throw new RangeError(`Height must be between 1 and ${MAX_HEIGHT} inclusive`);
  }

  let offset_x = 0;//Math.floor((MAX_WIDTH - w1) / 2);
  let offset_y = 0;//Math.floor((MAX_HEIGHT - h1) / 2);
  let offset_x1 = Math.floor((w1 - w2) / 2) + offset_x;
  let offset_y1 = Math.floor((h1 - h2) / 2) + offset_y;

  return initialBoard(w1,h1).map((row, y) => row.map((cell, x) => {

    if (x < offset_x || y < offset_y || (x - offset_x) >= w1 || (y - offset_y) >= h1) {
      return false;
    } else if (x < offset_x1 || y < offset_y1 || (x - offset_x1) >= w2 || (y - offset_y1) >= h2) {
      return true;

    } else {
      return false;
    }

  }));
}

export function RectangularAndSquaresLayout(width, height, squareSide): boolean[][] {
  if (width <= 0 || width > MAX_WIDTH) {
    throw new RangeError(`Width must be between 1 and ${MAX_WIDTH} inclusive`);
  }
  if (height <= 0 || height > MAX_HEIGHT) {
    throw new RangeError(`Height must be between 1 and ${MAX_HEIGHT} inclusive`);
  }

  let offset_x = 0;//Math.floor((MAX_WIDTH - width) / 2);
  let offset_y = 0;//Math.floor((MAX_HEIGHT - height) / 2);
  let offset_x1 = Math.floor((4) / 2) + offset_x;
  let offset_y1 = Math.floor((4) / 2) + offset_y;

  return initialBoard(width,height).map((row, y) => row.map((cell, x) => {

    if (x < offset_x || y < offset_y || (x - offset_x) >= width || (y - offset_y) >= height) {
      return false;
    } else if (x < offset_x1 || y < offset_y1 || (x - offset_x1) >= width - 4 || (y - offset_y1) >= height - 4) {
      return true;

    } else if ((x >= offset_x + 2 + squareSide && x < offset_x + width - 2 - squareSide) || (y >= offset_y + 2 + squareSide && y < offset_y + height - 2 - squareSide)) {
      return true;
    } else {
      return false;
    }

  }));
}
