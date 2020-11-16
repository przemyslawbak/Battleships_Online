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
  public chatMessage: string = '';
  public chatMessages: Array<ChatMessage> = [];
  public messages: string[];
  public gameStatus: any;
  public whoseTurn: any;
  public gameTurnNumber: number;
  public player1: string;
  public player2: string;
  public ctx: CanvasRenderingContext2D;
  public boardP1: number[][];
  public boardP2: number[][];
  private gameState: GameState;
  private _subGame: any;
  private message: ChatMessage;
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
    //prevent memory leak when component destroyed
    this._subGame.unsubscribe();
    this._subMessage.unsubscribe();
  }

  //todo: clean up this method
  public ngOnInit(): void {
    this.initGameSubscription();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const url = environment.apiUrl + 'api/game/join?id=' + id;
      this.http.getData(url).subscribe((game) => {
        if (game) {
          if (game.playersNames.includes(this.auth.getAuth().user)) {
            //if played already
            this.initGame(game);
          } else {
            if (game.gameMulti) {
              //if multiplayer
              if (game.playersNames.includes('')) {
                //if empty slot
                if (game.playersNames[0] === '') {
                  game.playersNames[0] = this.auth.getAuth().user;
                  game.playersDisplay[0] = this.auth.getAuth().displayName;
                } else {
                  game.playersNames[1] = this.auth.getAuth().user;
                  game.playersDisplay[1] = this.auth.getAuth().displayName;
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
        this.router.navigate(['play-game/' + this.gameState.gameId]);
      } else {
        this.router.navigate(['start-game']);
      }
    }
  }

  private initGame(game: GameState): void {
    this.game.setGame(game);
    this.signalRService.startConnection();
    this.signalRService.addGameStateListener();
    this.signalRService.addChatMessageListener();
    this.signalRService.broadcastGameState();
  }

  private initGameSubscription() {
    this.gameState = this.game.gameState;
    //https://stackoverflow.com/a/34714574
    this._subGame = this.game.gameStateChange.subscribe((game) => {
      this.gameState = game;
      this.gameStatus = this.gameState.gameStage;
      this.whoseTurn = this.gameState.gameTurnPlayer;
      this.gameTurnNumber = this.gameState.gameTurnNumber;
      this.player1 = this.gameState.playersDisplay[0];
      this.player2 = this.gameState.playersDisplay[1];
      this.boardP1 = this.gameState.boardP1;
      this.boardP2 = this.gameState.boardP2;
    });
    this.message = this.signalRService.message;
    this._subMessage = this.signalRService.messageChange.subscribe(
      (message: ChatMessage) => {
        this.message = message;
        this.chatMessages = [this.message].concat(this.chatMessages);
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
