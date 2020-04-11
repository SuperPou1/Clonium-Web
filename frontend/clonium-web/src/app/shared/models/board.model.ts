import {Cell} from './cell.model';
import {MAX_HEIGHT, MAX_WIDTH} from '../config/board-layouts';
import {GameState} from './game-state.model';

export class Board {
  width;
  height;
  playableCells: boolean[][]; // if 1: playable, 0 unplayable
  playedCells: Cell[][];

  currentState: GameState;
  offset_x: number;
  offset_y: number;

  constructor(width: number, height: number, playableCells: boolean[][]) {
    this.width = width;
    this.height = height;
    this.playableCells = playableCells;
    this.playedCells = this.playableCells.map((row, y) => row.map((cell, x) => cell ? Cell.EmptyCell(x, y) : Cell.UnplayableCell(x, y)));

    this.offset_x = Math.floor((MAX_WIDTH - width) / 2);
    this.offset_y = Math.floor((MAX_HEIGHT - height) / 2);

    this.currentState = GameState.PLAYER_1;
  }

  getCell(x: number, y: number): Cell {
    return this.playedCells[y + this.offset_y][x + this.offset_x];
  }

  getCellNeighbors(cell): Array<Cell> {
    const x = cell.x;
    const y = cell.y;
    const result = [];
    console.log(x, y);
    if (x - 1 >= 0 && this.playableCells[y][x - 1]) {
      result.push(this.playedCells[y][x - 1]);
    }
    if (y - 1 >= 0 && this.playableCells[y - 1][x]) {
      result.push(this.playedCells[y - 1][x]);
    }
    if (x + 1 < MAX_WIDTH && this.playableCells[y][x + 1]) {
      result.push(this.playedCells[y][x + 1]);
    }
    if (y + 1 < MAX_HEIGHT && this.playableCells[y + 1][x]) {
      result.push(this.playedCells[y + 1][x]);
    }
    console.log(result);
    return result;

  }

  setCell(x: number, y: number, cell: Cell): void {
    this.playedCells[y][x] = cell;
  }


}



