import {Component, Input, OnInit} from '@angular/core';
import {Board} from '../../models/board.model';
import {Cell} from '../../models/cell.model';
import {GameState} from '../../models/game-state.model';
import {Player} from '../../models/player.model';

import * as _ from 'lodash';
import {wait} from '../../utils/time-management';
import {GameService} from '../../../core/services/game.service';
import {RoomService} from '../../../core/services/room.service';
import {nextGameState, playerToGameState} from '../../utils/utilFunctions';

/**
 * @description
 * This is where all the magic happens.
 * The game logic and the Game-play lifecycle are declared in this component
 *
 * For more details about the board configuration, check board.model
 *
 * @author
 * Rafaa Seddik
 */
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html'
})
export class BoardComponent implements OnInit {

  // Toggle if the game is online/offline
  @Input() isOnline: boolean = false;
  // The board configuration and state
  @Input() board: Board;
  // Toggle if a player is disconnected
  noPlayer1: boolean = false;
  noPlayer2: boolean = true;
  noPlayer3: boolean = true;
  noPlayer4: boolean = true;
  // The current player number
  currentPlayer: Player;
  // The current roomID : get from the Game.service
  roomID: string;
  // a util function to Player.model to a GameState.model
  playerToGameState = playerToGameState;
  // Types declaration
  GameState = GameState;
  Player = Player;
  // Saves the last move by other players, to highlight the corresponding cell in the UI
  lastMove: Cell;
  // Players' scores
  player1Score = 0;
  player2Score = 0;
  player3Score = 0;
  player4Score = 0;
  // Used to lock the board, to prevent clicking on the same cell more then once
  boardLocked: boolean = false;

  constructor(private gameService: GameService, private roomService: RoomService) {
  }

  /**
   * When initialising this component, subscribe to all the subjects declared in the Room.service
   */
  ngOnInit() {
    this.updateScore();
    if (this.isOnline) {
      this.currentPlayer = this.gameService.curentPlayer;
      this.roomID = this.roomService.roomID;
      this.updateConnectedPlayersNumber();

      /**
       * Subscribe to player_X_Joined Event
       */

      this.roomService.playerOneJoined.asObservable().subscribe(joined => {
        if (joined) {
          if (this.noPlayer1 != false) {
            this.noPlayer1 = false;
            this.board.presentPlayers++;
          }
        } else {
          if (this.noPlayer1 != true) {
            this.noPlayer1 = true;
            this.board.presentPlayers--;
          }
        }
      });
      this.roomService.playerTwoJoined.asObservable().subscribe(joined => {
        if (joined) {
          if (this.noPlayer2 != false) {
            this.noPlayer2 = false;
            this.board.presentPlayers++;
          }
        } else {
          if (this.noPlayer2 != true) {
            this.noPlayer2 = true;
            this.board.presentPlayers--;
          }
        }
      });
      this.roomService.playerThreeJoined.asObservable().subscribe(joined => {
        if (joined) {
          if (this.noPlayer3 != false) {
            this.noPlayer3 = false;
            this.board.presentPlayers++;
          }
        } else {
          if (this.noPlayer3 != true) {
            this.noPlayer3 = true;
            this.board.presentPlayers--;
          }
        }
      });
      this.roomService.playerFourJoined.asObservable().subscribe(joined => {
        if (joined) {
          if (this.noPlayer4 != false) {
            this.noPlayer4 = false;
            this.board.presentPlayers++;
          }
        } else {
          if (this.noPlayer4 != true) {
            this.noPlayer4 = true;
            this.board.presentPlayers--;
          }
        }
      });
      /**
       * Subscribe to the move Event and call incrementFromOtherPlayer if another player made the move
       */
      this.roomService.move.asObservable().subscribe(move => {
        let movePlayer: Player;
        switch (move.player) {
          case 1:
            movePlayer = Player.PLAYER_1;
            break;
          case 2:
            movePlayer = Player.PLAYER_2;
            break;
          case 3:
            movePlayer = Player.PLAYER_3;
            break;
          case 4:
            movePlayer = Player.PLAYER_4;
            break;
          default:
            movePlayer = Player.PLAYER_2;
        }
        if (movePlayer != this.currentPlayer) {
          this.incrementFromOtherPlayer(move.x, move.y, movePlayer);
        }
      });
    }

  }

  /**
   * @deprecated
   * TODO : Remove this function
   * @author
   * Rafaa Seddik
   */
  updateConnectedPlayersNumber() {
    this.roomService.getConnectedPlayers(this.roomID).then(nb => {
      if (nb < this.board.presentPlayers) {
        this.board.presentPlayers = nb;
      }
      if (this.board.presentPlayers < this.board.playersNumber) {
        setTimeout(() => this.updateConnectedPlayersNumber(), 1000);
      }
    });
  }

  /**
   * @description
   * Copies the room ID into the clipboard
   *
   * @author
   * Rafaa Seddik
   */
  copyToClipboard(event) {
    //TODO : Develop the copy into clipboard function
  }

  /**
   * @description
   * Updates the Game state to ANALYSING
   * Returns the cells containing a value 4
   *
   * @author
   * Rafaa Seddik
   */
  analyse(): Array<Cell> {
    this.board.currentState = GameState.ANALYSING;
    const cells = (_.flatten(this.board.playedCells) as Array<Cell>)
      .filter(cell => cell.player === Player.PLAYER_1 || cell.player === Player.PLAYER_2 || cell.player === Player.PLAYER_3 || cell.player === Player.PLAYER_4)
      .filter(cell => cell.value === 4);

    return cells;
  }

  /**
   * @description
   * Updates the Game state to UPDATING
   * Explodes the exploding cells
   *
   * @author
   * Rafaa Seddik
   */
  async update(cells: Array<Cell>, player: Player) {
    await wait(500);
    this.board.currentState = GameState.UPDATING;
    cells.forEach(cell => {
      cell.explode();
      this.board.getCellNeighbors(cell).forEach(neighborCell => neighborCell.increment(player));
    });
  }

  /**
   * @description
   * Recursively analyse the and update the board until there is nothing to update.
   * then update the game state to the next player role
   *
   * TODO : Optimise this function
   * @author
   * Rafaa Seddik
   */
  async nextRole() {
    if (this.board.currentState === GameState.PLAYER_1) {
      let explosionCells = this.analyse();
      while (explosionCells.length > 0) {
        await this.update(explosionCells, Player.PLAYER_1);
        explosionCells = this.analyse();
      }
      if (this.isOnline && this.currentPlayer == Player.PLAYER_1) {
        this.roomService.sendSerialBoard(this.board.serialize(), 1);
      }
      this.board.currentState = nextGameState(Player.PLAYER_1, this.board.playersNumber);
    } else if (this.board.currentState === GameState.PLAYER_2) {
      let explosionCells = this.analyse();
      while (explosionCells.length > 0) {
        await this.update(explosionCells, Player.PLAYER_2);
        explosionCells = this.analyse();
      }
      if (this.isOnline && this.currentPlayer == Player.PLAYER_2) {
        this.roomService.sendSerialBoard(this.board.serialize(), 2);
      }
      this.board.currentState = nextGameState(Player.PLAYER_2, this.board.playersNumber);
    } else if (this.board.currentState === GameState.PLAYER_3) {
      let explosionCells = this.analyse();
      while (explosionCells.length > 0) {
        await this.update(explosionCells, Player.PLAYER_3);
        explosionCells = this.analyse();
      }
      if (this.isOnline && this.currentPlayer == Player.PLAYER_3) {
        this.roomService.sendSerialBoard(this.board.serialize(), 3);
      }
      this.board.currentState = nextGameState(Player.PLAYER_3, this.board.playersNumber);
    } else if (this.board.currentState === GameState.PLAYER_4) {
      let explosionCells = this.analyse();
      while (explosionCells.length > 0) {
        await this.update(explosionCells, Player.PLAYER_4);
        explosionCells = this.analyse();
      }
      if (this.isOnline && this.currentPlayer == Player.PLAYER_4) {
        this.roomService.sendSerialBoard(this.board.serialize(), 4);
      }
      this.board.currentState = nextGameState(Player.PLAYER_4, this.board.playersNumber);
    }
    this.updateScore();
    if (this.board.lostPlayers.has(this.board.currentState) && this.board.lostPlayers.size != this.board.playersNumber - 1) {
      this.nextRole();
    }
  }

  /**
   * @description
   * Used as an event handler when a cell is clicked
   * It locks the board to prevent clicking on the same cell more then once
   * If the game is online, broadcast the move, and go to next role
   *
   * @author
   * Rafaa Seddik
   */
  async increment(cell: Cell) {
    this.lastMove = null;
    if (playerToGameState(cell.player) == this.board.currentState && (!this.isOnline || (this.currentPlayer == cell.player && !this.boardLocked))) {
      if (this.isOnline) {
        this.boardLocked = true;
        this.roomService.emitMove(this.currentPlayer, cell).then((a) => {
          cell.increment(cell.player);
          this.nextRole();
        }).finally(() => {
          this.boardLocked = false;
        });
      } else {
        cell.increment(cell.player);
        this.nextRole();
      }
    }
  }

  /**
   * @description
   * Used to apply a move from another player in an online game
   *
   * @author
   * Rafaa Seddik
   */
  async incrementFromOtherPlayer(x: number, y: number, player: Player) {
    let moveState = playerToGameState(player);
    if (this.board.currentState === moveState && this.currentPlayer != player) {
      this.lastMove = this.board.playedCells[y][x];
      this.board.playedCells[y][x].increment(player);
      this.nextRole();
    }

  }

  /**
   * @description
   * Calculates each players score
   * If a player gets 0, it is registered as lost.
   * If all players lose, except the winner, the game state is set to PLAYER_X_WON
   *
   * @author
   * Rafaa Seddik
   */
  updateScore() {
    this.player1Score = (_.flatten(this.board.playedCells) as Array<Cell>).filter(cell => cell.player === Player.PLAYER_1).length;
    this.player2Score = (_.flatten(this.board.playedCells) as Array<Cell>).filter(cell => cell.player === Player.PLAYER_2).length;
    if (this.board.playersNumber >= 3) {
      this.player3Score = (_.flatten(this.board.playedCells) as Array<Cell>).filter(cell => cell.player === Player.PLAYER_3).length;
    }
    if (this.board.playersNumber == 4) {
      this.player4Score = (_.flatten(this.board.playedCells) as Array<Cell>).filter(cell => cell.player === Player.PLAYER_4).length;
    }

    if (this.player1Score === 0 && !this.board.lostPlayers.has(GameState.PLAYER_1)) {
      this.board.lostPlayers.add(GameState.PLAYER_1);
    }
    if (this.player2Score === 0 && !this.board.lostPlayers.has(GameState.PLAYER_2)) {
      this.board.lostPlayers.add(GameState.PLAYER_2);
    }
    if (this.player3Score === 0 && !this.board.lostPlayers.has(GameState.PLAYER_3) && this.board.playersNumber > 2) {
      this.board.lostPlayers.add(GameState.PLAYER_3);
    }
    if (this.player4Score === 0 && !this.board.lostPlayers.has(GameState.PLAYER_4) && this.board.playersNumber > 3) {
      this.board.lostPlayers.add(GameState.PLAYER_4);
    }
    if (this.board.lostPlayers.size == this.board.playersNumber - 1) {
      if (!this.board.lostPlayers.has(GameState.PLAYER_1)) {
        this.board.currentState = GameState.PLAYER_1_WON;
        this.roomService.removeSession();
      } else if (!this.board.lostPlayers.has(GameState.PLAYER_2)) {
        this.board.currentState = GameState.PLAYER_2_WON;
        this.roomService.removeSession();
      } else if (!this.board.lostPlayers.has(GameState.PLAYER_3)) {
        this.board.currentState = GameState.PLAYER_3_WON;
        this.roomService.removeSession();
      } else if (!this.board.lostPlayers.has(GameState.PLAYER_4)) {
        this.board.currentState = GameState.PLAYER_4_WON;
        this.roomService.removeSession();
      }
    }

  }
}
