import { BoardService } from '@services/board.service';
import { GameState } from '@models/game-state.model';
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
  private _subGame: any;
  private _subMessage: any;
  private _subBoard: any;
  public userName: string;
  private countDown: Subscription;
  public count = 180;
  public fleetWaiting: Array<ShipComponent>;
  public fleetDeployed: Array<ShipComponent>;
  public dragEnd: DropModel = {} as DropModel;
  public playersBoard: BoardCell[][];

  constructor(
    private board: BoardService,
    private auth: AuthService,
    private signalRService: SignalRService,
    private game: GameService,
    private player: PlayerService
  ) {
    this.isDeployed = false;
    this.fleetWaiting = this.createFleet();
    this.fleetDeployed = [];
  }

  @ViewChild('board', { read: ElementRef, static: false }) boardElement: any;
  @ViewChild('nextItem', { read: ElementRef, static: false }) nextItem: any;

  ngOnDestroy() {
    this.countDown = null; //todo: what if goes out the view?
    if (this._subGame && this._subMessage && this._subBoard) {
      this._subGame.unsubscribe();
      this._subMessage.unsubscribe();
      this._subBoard.unsubscribe();
    }
  }

  public ngOnInit(): void {
    this.userName = this.auth.getAuth().user;
    this.startCounter();
    //todo: do I need to reset them?
    this.resetMessageListeners();
    this.initGameSubscription();
    this.CreateBoard();
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

    this._subBoard = this.board.boardChange.subscribe(
      (board: BoardCell[][]) => {
        this.playersBoard = board;
        console.log('hit board');
      }
    );
  }

  private CreateBoard(): void {
    this.board.createEmptyBoard();
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
    if (this.board.isDropAllowed) {
      let dropCells: Array<BoardCell> = this.board.getDropCells(
        row,
        col,
        this.fleetWaiting
      );
      this.dragEnd = this.board.hoverPlace;
      this.moveFromList1To2();
      this.board.deployShip(row, col, dropCells);
    }
  }

  public resetBoardElement(element: HTMLElement, row: number, col: number) {
    this.board.resetBoardElement(element, row, col);
  }

  public checkHoveredElement(
    position: any,
    elementType: string,
    row: number,
    col: number,
    element: HTMLElement
  ): void {
    this.board.checkHoveredElement(
      position,
      elementType,
      row,
      col,
      element,
      this.fleetWaiting
    );
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
      game.players[
        this.player.getPlayerNumber()
      ].board = this.board.playersBoard;
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
      for (let i = 0; i < this.fleetWaiting.length; i++) {
        this.board.playersBoard = this.board.autoDeployShip(
          this.fleetWaiting[i]
        );
        //todo: board = deploy/update board, push/spilce [0] from waiting
      }
    }
  }

  public clearBoard(): void {
    this.fleetWaiting = this.createFleet();
    this.fleetDeployed = [];
    this.board.playersBoard = this.board.getEmptyBoard();
  }
}