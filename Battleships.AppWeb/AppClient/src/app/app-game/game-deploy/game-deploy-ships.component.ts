import { GameStage, GameState } from '@models/game-state.model';
import { PlayerService } from '@services/player.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { ChatMessage } from '@models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';
import { Subscription, timer } from 'rxjs';
import { DropModel } from '@models/drop-model';
import { ShipComponent } from './../game-ship/ship.component';

@Component({
  templateUrl: './game-deploy-ships.component.html',
  styleUrls: ['./game-deploy-ships.component.css'],
})
export class GameDeployComponent implements OnInit {
  public isDeployed: boolean;
  public isDeploymentAllowed: boolean;
  public chatMessage: string = '';
  public chatMessages: Array<ChatMessage> = [];
  public playersBoard: BoardCell[][];
  private _subGame: any;
  private _subMessage: any;
  public userName: string;
  private countDown: Subscription;
  public count = 180;
  public fleetWaiting: Array<ShipComponent>;
  public fleetDeployed: Array<ShipComponent>;
  public hoverPlace: DropModel = {} as DropModel;
  public dragEnd: DropModel = {} as DropModel;
  public isDropAllowed: boolean = false;
  public lastDropCells: Array<BoardCell> = [];

  constructor(
    private auth: AuthService,
    private signalRService: SignalRService,
    private game: GameService,
    private player: PlayerService
  ) {
    this.isDeployed = false;
    this.playersBoard = this.getEmptyBoard();
    this.fleetWaiting = this.createFleet();
    this.fleetDeployed = [];
  }

  @ViewChild('board', { read: ElementRef, static: false }) boardElement: any;
  @ViewChild('nextItem', { read: ElementRef, static: false }) nextItem: any;

  ngOnDestroy() {
    this.countDown = null; //todo: what if goes out the view?
    if (this._subGame && this._subMessage) {
      this._subGame.unsubscribe();
      this._subMessage.unsubscribe();
    }
  }

  public ngOnInit(): void {
    this.userName = this.auth.getAuth().user;
    this.startCounter();
    //todo: do I need to reset them?
    this.resetMessageListeners();
    this.initGameSubscription();
  }

  public getEmptyBoard(): BoardCell[][] {
    let board: BoardCell[][] = [];
    for (let i = 0; i < 10; i++) {
      board[i] = [];
      for (let j = 0; j < 10; j++) {
        board[i][j] = {
          row: j,
          col: i,
          value: 0,
          color: 'rgba(0, 162, 255, 0.2)',
        } as BoardCell;
      }
    }

    return board;
  }

  private startCounter() {
    this.countDown = timer(0, 1000).subscribe(() => {
      this.isDeploymentAllowed = true; //todo: remove later on
      if (this.isDeploymentAllowed && !this.isDeployed) {
        if (this.count <= 0) {
          this.autoDeploy();
          this.confirm();
        } else {
          this.count--;
        }
      } else {
        this.count = 180;
      }
      //todo: if count == 0 => auto deploy => ready
      return this.count;
    });
  }

  private resetMessageListeners() {
    this.signalRService.startConnection();
    this.signalRService.removeChatMessageListener();
    this.signalRService.removeGameStateListener();
    this.signalRService.addChatMessageListener();
    this.signalRService.addGameStateListener();
  }

  private initGameSubscription() {
    this._subGame = this.game.gameStateChange.subscribe((game) => {
      let p0Deployed: boolean = game.players[0].isDeployed;
      let p1Deployed: boolean = game.players[1].isDeployed;
      this.isDeploymentAllowed = game.isDeploymentAllowed;

      if (p0Deployed && p1Deployed) {
        //todo: start game!
        alert('start');
      }
      console.log('hit game');
    });
    this._subMessage = this.signalRService.messageChange.subscribe(
      (message: ChatMessage) => {
        this.chatMessages = [message].concat(this.chatMessages);
        console.log('hit msg');
      }
    );
  }

  public sendChatMessage(): void {
    if (this.chatMessage != '') {
      this.signalRService.broadcastChatMessage(this.chatMessage);
      this.chatMessage = '';
    }
  }

  public setRotation(name: string): void {
    const id: string = this.getIdFromElementName(name);
    let item: ShipComponent = this.getArrayItem(name, id);
    item.rotation = item.rotation === 0 ? 90 : 0;
  }

  public deployShip(row: number, col: number): void {
    if (this.isDropAllowed) {
      let dropCells: Array<BoardCell> = this.getDropCells(row, col);
      this.dragEnd = this.hoverPlace;
      this.moveFromList1To2();
      for (let i = 0; i < dropCells.length; i++) {
        this.playersBoard[dropCells[i].col][dropCells[i].row].value = 1;
        this.playersBoard[dropCells[i].col][dropCells[i].row].color = 'green';
      }
    }
  }

  public resetElement(element: HTMLElement, row: number, col: number) {
    if (this.playersBoard[col][row].value == 1) {
      element.style.backgroundColor = 'green';
    } else {
      element.style.backgroundColor = 'rgba(0, 162, 255, 0.2)';
    }
    for (let i = 0; i < this.lastDropCells.length; i++) {
      if (
        this.playersBoard[this.lastDropCells[i].col][this.lastDropCells[i].row]
          .value == 1
      ) {
        this.playersBoard[this.lastDropCells[i].col][
          this.lastDropCells[i].row
        ].color = 'green';
      } else {
        this.playersBoard[this.lastDropCells[i].col][
          this.lastDropCells[i].row
        ].color = 'rgba(0, 162, 255, 0.2)';
      }
    }
  }

  public hoveredElement(
    position: any,
    elementType: string,
    row: number,
    col: number,
    element: HTMLElement
  ): void {
    let dropPlace = {} as DropModel;
    dropPlace.cellX = position.x;
    dropPlace.cellY = position.y;
    dropPlace.type = elementType;
    dropPlace.row = row;
    dropPlace.col = col;

    let dropCells: Array<BoardCell> = this.getDropCells(row, col);
    this.lastDropCells = dropCells;

    if (elementType == 'cell') {
      let allow: boolean = this.validateDropPlace(dropCells);

      if (allow) {
        this.isDropAllowed = true;
        this.hoverPlace = dropPlace;
        for (let i = 0; i < dropCells.length; i++) {
          this.playersBoard[dropCells[i].col][dropCells[i].row].color =
            'rgb(0, 162, 255)';
        }
      } else {
        this.isDropAllowed = false;
        element.style.backgroundColor = 'red';
      }
    }
  }

  private moveFromList1To2(): void {
    this.fleetDeployed.push(this.fleetWaiting[0]);
    this.fleetWaiting.splice(0, 1);
  }

  private getArrayItem(name: string, id: string): ShipComponent {
    return name.split('-')[1] === 'fleetWaiting'
      ? this.fleetWaiting[+id]
      : this.fleetDeployed[+id];
  }

  private getIdFromElementName(name: string): string {
    return name.split('-')[0];
  }

  private validateDropPlace(dropPlace: Array<BoardCell>): boolean {
    let result: boolean = true;

    if (this.fleetWaiting.length > 0) {
      if (dropPlace.length !== this.fleetWaiting[0].size) {
        result = false;
      }
    } else {
      result = false;
    }

    if (!this.isShipNotTouchingOther(dropPlace)) {
      result = false;
    }

    return result;
  }

  private isShipNotTouchingOther(dropPlace: BoardCell[]): boolean {
    let result: boolean = true;
    let forbiddenCells: Array<BoardCell> = this.GetForbiddenCells(dropPlace);

    if (!this.compareBoardWithForbiddenCells(forbiddenCells)) {
      result = false;
    }

    return result;
  }

  private compareBoardWithForbiddenCells(
    forbiddenCells: Array<BoardCell>
  ): boolean {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (this.playersBoard[i][j].value !== 1) continue;
        for (let f = 0; f < forbiddenCells.length; f++) {
          if (
            this.playersBoard[i][j].col == forbiddenCells[f].col &&
            this.playersBoard[i][j].row == forbiddenCells[f].row &&
            this.playersBoard[i][j].value == 1
          ) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private GetForbiddenCells(dropPlace: BoardCell[]): BoardCell[] {
    let list: BoardCell[] = [];

    for (let i = 0; i < dropPlace.length; i++) {
      list.push({
        row: dropPlace[i].row,
        col: dropPlace[i].col,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row,
        col: dropPlace[i].col + 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row + 1,
        col: dropPlace[i].col + 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row + 1,
        col: dropPlace[i].col,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row,
        col: dropPlace[i].col - 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row - 1,
        col: dropPlace[i].col - 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row - 1,
        col: dropPlace[i].col,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row - 1,
        col: dropPlace[i].col + 1,
        value: 0,
      } as BoardCell);
      list.push({
        row: dropPlace[i].row + 1,
        col: dropPlace[i].col - 1,
        value: 0,
      } as BoardCell);
    }

    return list;
  }

  private getDropCells(row: number, col: number): Array<BoardCell> {
    let result: Array<BoardCell> = [];
    if (this.fleetWaiting.length > 0) {
      for (let i = 0; i < this.fleetWaiting[0].size; i++) {
        let cellModel: BoardCell = this.getCell(
          this.fleetWaiting[0].rotation,
          i,
          row,
          col
        );

        if (cellModel.col >= 0 && cellModel.row >= 0 && cellModel.value >= 0) {
          result.push(cellModel);
        }
      }
    }

    return result;
  }

  private getCell(
    rotation: number,
    i: number,
    row: number,
    col: number
  ): BoardCell {
    let item: BoardCell =
      rotation == 0
        ? ({ row: row, col: col + i, value: 0 } as BoardCell)
        : ({ row: row + i, col: col, value: 0 } as BoardCell);

    let exists: boolean = this.playersBoard.some((b) =>
      b.some((c) => c.row == item.row && c.col == item.col)
    );

    return exists ? item : ({ row: -1, col: -1, value: -1 } as BoardCell);
  }

  private createFleet(): Array<ShipComponent> {
    return [
      { size: 4, rotation: 0 },
      { size: 3, rotation: 0 },
      { size: 3, rotation: 0 },
      { size: 2, rotation: 0 },
      { size: 2, rotation: 0 },
      { size: 2, rotation: 0 },
      { size: 1, rotation: 0 },
      { size: 1, rotation: 0 },
      { size: 1, rotation: 0 },
      { size: 1, rotation: 0 },
    ];
  }

  public confirm(): void {
    if (this.fleetDeployed.length == 10) {
      this.isDeployed = true;
      this.count = 0;
      let game: GameState = this.game.getGame();
      game.players[this.player.getPlayerNumber()].isDeployed = true;
      game.players[this.player.getPlayerNumber()].board = this.playersBoard;
      game.players[this.player.getPlayerNumber()].fleet = this.fleetDeployed;
      this.signalRService.broadcastChatMessage(
        this.game.getGame().players[this.player.getPlayerNumber()].displayName +
          ' finished deploying ships.'
      );
      this.signalRService.broadcastGameState(game);
    }
  }

  public quitGame(): void {
    this.signalRService.stopConnection();
  }

  public autoDeploy(): void {
    if (this.fleetWaiting.length > 0) {
      //todo: board = ??
      //todo: fleet = ??
      for (let i = 0; i < this.fleetWaiting.length; i++) {
        this.playersBoard = [];
      }
    }
  }

  public clearBoard(): void {
    this.fleetWaiting = this.createFleet();
    this.fleetDeployed = [];
    this.playersBoard = this.getEmptyBoard();
  }
}
