import {Cell} from './cell.model';
import {MAX_HEIGHT, MAX_WIDTH} from '../utils/board-layouts';
import {GameState} from './game-state.model';
import {Player} from './player.model';
import * as _ from 'lodash';

export class Board {
  width;
  height;
  playableCells: boolean[][]; // if 1: playable, 0 unplayable
  playedCells: Cell[][];
  playersNumber:number;
  presentPlayers:number;
  lostPlayers : Set<GameState> = new Set<GameState>();
  currentState: GameState;
  // tslint:disable-next-line:variable-name
  offset_x: number;
  // tslint:disable-next-line:variable-name
  offset_y: number;

  constructor(width: number, height: number, playableCells: boolean[][],playersNumber:number=2) {
    this.width = width;
    this.height = height;
    this.playableCells = playableCells;
    this.playedCells = this.playableCells.map((row, y) => row.map((cell, x) => cell ? Cell.EmptyCell(x, y) : Cell.UnplayableCell(x, y)));

    this.offset_x = 0;//Math.floor((MAX_WIDTH - width) / 2);
    this.offset_y = 0;//Math.floor((MAX_HEIGHT - height) / 2);

    this.playersNumber=playersNumber;
    this.presentPlayers = 1;
    this.currentState = GameState.PLAYER_1;
  }

  getCell(x: number, y: number): Cell {
    return this.playedCells[y + this.offset_y][x + this.offset_x];
  }

  getCellNeighbors(cell): Array<Cell> {
    const x = cell.x;
    const y = cell.y;
    const result = [];
    if (x - 1 >= 0 && this.playableCells[y][x - 1]) {
      result.push(this.playedCells[y][x - 1]);
    }
    if (y - 1 >= 0 && this.playableCells[y - 1][x]) {
      result.push(this.playedCells[y - 1][x]);
    }
    if (x + 1 < this.width && this.playableCells[y][x + 1]) {
      result.push(this.playedCells[y][x + 1]);
    }
    if (y + 1 < this.height && this.playableCells[y + 1][x]) {
      result.push(this.playedCells[y + 1][x]);
    }
    return result;

  }


  canPlay(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height || !this.playableCells[y][x]) {
      return false;
    } else {
      return true;
    }
  }

  setCell(x: number, y: number, cell: Cell): void {
    this.playedCells[y][x] = cell;
  }


  serialize():string{

    return JSON.stringify((_.flatten(this.playedCells) as Array<Cell>)
      .filter(cell => cell.player === Player.PLAYER_1 || cell.player === Player.PLAYER_2 || cell.player === Player.PLAYER_3|| cell.player === Player.PLAYER_4));
  }
  deserialize(serialBoard:string){
    let rawCellsObject = JSON.parse(serialBoard);
    rawCellsObject.forEach(rawCell=>{
      this.setCell(rawCell.x,rawCell.y, new Cell(rawCell.x,rawCell.y,rawCell.player,rawCell.value))
    })
    console.log(this.playedCells)
  }

}



