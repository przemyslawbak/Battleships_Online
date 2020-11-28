import { BoardCell } from '@models/board-cell.model';
import { ChatMessage } from './../../app-core/_models/chat-message.model';
import { AuthService } from '@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';
import { HttpService } from '@services/http.service';
import { environment } from '@environments/environment';
import { ModalService } from '@services/modal.service';
import { GameState } from '@models/game-state.model';

@Component({
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.css'],
})
export class GamePlayComponent implements OnInit {
  public userName: string;
  public chatMessage: string = '';
  public chatMessages: Array<ChatMessage> = [];
  public messages: string[];
  public gameStatus: any;
  public gameTurnNumber: number;
  public player1: string;
  public player2: string;
  public ctx: CanvasRenderingContext2D;
  public boardP1: BoardCell[][];
  public boardP2: BoardCell[][];
  private _subGame: any;
  private _subMessage: any;

  constructor(
    private auth: AuthService,
    private modalService: ModalService,
    private router: Router,
    private game: GameService,
    private route: ActivatedRoute,
    private signalRService: SignalRService,
    private http: HttpService
  ) {}

  ngOnDestroy() {
    if (this._subGame && this._subMessage) {
      this._subGame.unsubscribe();
      this._subMessage.unsubscribe();
    }
  }

  //todo: clean up this crap
  public ngOnInit(): void {
    this.initGameSubscription();
    this.userName = this.auth.getAuth().user;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const url = environment.apiUrl + 'api/game/join?id=' + id;
      this.http.getData(url).subscribe((game: GameState) => {
        if (game) {
          let gameUserNames: string[] = [
            game.players[0].userName,
            game.players[1].userName,
          ];
          if (gameUserNames.includes(this.auth.getAuth().user)) {
            //if played already
            this.initGame(game);
          } else {
            if (game.gameMulti) {
              //if multiplayer
              if (gameUserNames.includes('')) {
                //if empty slot
                if (gameUserNames[0] === '') {
                  game.players[0].userName = this.auth.getAuth().user;
                  game.players[0].displayName = this.auth.getAuth().displayName;
                } else {
                  game.players[1].userName = this.auth.getAuth().user;
                  game.players[1].displayName = this.auth.getAuth().displayName;
                }
                this.initGame(game);
                this.signalRService.broadcastChatMessage(
                  'Connected to the game.'
                );
              } else {
                this.modalService.open(
                  'info-modal',
                  'There is no empty player slot available.'
                );
                this.router.navigate(['open-game']);
              }
            } else {
              this.modalService.open(
                'info-modal',
                'Game is for singe player only.'
              );
            }
          }
        } else {
          this.modalService.open('info-modal', 'Could not find game.');
        }
      });
    } else {
      if (this.game.isGameStarted()) {
        this.router.navigate(['play-game/' + this.game.getGame().gameId]);
      } else {
        this.router.navigate(['start-game']);
      }
    }
  }

  private initGame(game: GameState): void {
    this.game.setGame(game);
    this.resetMessageListeners();
    this.signalRService.broadcastGameState();
    if (!game.isStartAllowed) {
      this.router.navigate(['deploy-ships']);
    }
    //todo: else play the game
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
      this.gameStatus = game.gameStage;
      this.gameTurnNumber = game.gameTurnNumber;
      this.player1 = game.players[0].displayName;
      this.player2 = game.players[1].displayName;
      this.boardP1 = game.players[0].board;
      this.boardP2 = game.players[1].board;
      console.log('hit game');
    });
    this._subMessage = this.signalRService.messageChange.subscribe(
      (message: ChatMessage) => {
        this.chatMessages = [message].concat(this.chatMessages);
        console.log('hit msg');
      }
    );
  }

  public fireTorpedo(j: number, k: number) {
    alert('attacked: ' + j + '/' + k);
    //todo: check for valid hit
    //todo: check for ship being hit
  }

  public onBack(): void {
    this.router.navigate(['']);
  }

  public sendChatMessage(): void {
    if (this.chatMessage != '') {
      this.signalRService.broadcastChatMessage(this.chatMessage);
      this.chatMessage = '';
    }
  }
}
