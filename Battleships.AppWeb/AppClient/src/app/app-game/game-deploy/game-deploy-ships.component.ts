import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BoardCell } from '@models/board-cell.model';
import { ChatMessage } from '@models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';
import { Subscription, timer } from 'rxjs';
import { PlayerService } from '@services/player.service';
import { DropModel } from './../../app-core/_models/drop-model';
import { ShipComponent } from './../game-ship/ship.component';

@Component({
  templateUrl: './game-deploy-ships.component.html',
  styleUrls: ['./game-deploy-ships.component.css'],
})
export class GameDeployShips implements OnInit {
  private playerNumber: number;
  public isDeploymentAllowed: boolean;
  public chatMessage: string = '';
  public chatMessages: Array<ChatMessage> = [];
  public board: BoardCell[][]; //todo: ony 1p?
  private _subGame: any;
  private _subMessage: any;
  public userName: string;
  private countDown: Subscription;
  public count = 180;
  public fleetWaiting: Array<ShipComponent> = [];
  public fleetDeployed: Array<ShipComponent> = [];
  public hoverPlace: DropModel = {} as DropModel;
  public dragEnd: DropModel = {} as DropModel;
  public isDropAllowed: boolean = false;
  public lastDropCells: Array<BoardCell> = [];

  constructor(
    private auth: AuthService,
    private signalRService: SignalRService,
    private game: GameService,
    private player: PlayerService
  ) {}

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
    this.playerNumber = this.player.getPlayerNumber();
    this.userName = this.auth.getAuth().user;
    this.startCounter();
    //todo: do I need to reset them?
    this.resetMessageListeners();
    this.initGameSubscription();
  }

  private startCounter() {
    this.countDown = timer(0, 1000).subscribe(() => {
      this.isDeploymentAllowed = true; //todo: remove later on
      if (this.isDeploymentAllowed) {
        this.count--;
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
      this.isDeploymentAllowed = game.isDeploymentAllowed;
      this.board = game.players[this.playerNumber].board;
      this.fleetWaiting = game.players[this.playerNumber].fleet;
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
        this.board[dropCells[i].col][dropCells[i].row].value = 1;
      }
    }
  }

  public resetElement(element: HTMLElement) {
    element.style.backgroundColor = 'rgba(0, 162, 255, 0.2)';
    for (let i = 0; i < this.lastDropCells.length; i++) {
      this.board[this.lastDropCells[i].col][this.lastDropCells[i].row].colour =
        'rgba(0, 162, 255, 0.2)';
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
          this.board[dropCells[i].col][dropCells[i].row].colour =
            'rgb(0, 162, 255)';
        }
      } else {
        this.isDropAllowed = false;
        element.style.backgroundColor = 'red';
      }
    }
  }

  private moveFromList1To2(): void {
    const item = this.updateShipsTopLeft(this.fleetWaiting[0]);
    this.fleetDeployed.push(item);
    this.fleetWaiting.splice(0, 1);
  }

  private updateShipsTopLeft(ship: ShipComponent): ShipComponent {
    ship.left =
      this.dragEnd.cellX -
      this.boardElement.nativeElement.getBoundingClientRect().x;
    ship.top =
      this.dragEnd.cellY -
      this.boardElement.nativeElement.getBoundingClientRect().y;
    return ship;
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

    if (dropPlace.length !== this.fleetWaiting[0].size) {
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
        if (this.board[i][j].value !== 1) continue;
        for (let f = 0; f < forbiddenCells.length; f++) {
          if (
            this.board[i][j].col == forbiddenCells[f].col &&
            this.board[i][j].row == forbiddenCells[f].row &&
            this.board[i][j].value == 1
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

    let exists: boolean = this.board.some((b) =>
      b.some((c) => c.row == item.row && c.col == item.col)
    );

    return exists ? item : ({ row: -1, col: -1, value: -1 } as BoardCell);
  }
}
