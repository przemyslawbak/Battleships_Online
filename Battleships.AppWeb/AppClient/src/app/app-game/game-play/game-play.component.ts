import { AuthService } from '@services/auth.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
  public gameStatus: any;
  public whoseTurn: any;
  public gameTurnNumber: number;
  public player1: string;
  public player2: string;
  public ctx: CanvasRenderingContext2D;
  public boardP1: number[][];
  public boardP2: number[][];

  constructor(
    private auth: AuthService,
    private modalService: ModalService,
    private router: Router,
    private game: GameService,
    private route: ActivatedRoute,
    private signalRService: SignalRService,
    private http: HttpService
  ) {}

  //todo: clean up this method
  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const url = environment.apiUrl + 'api/game/join?id=' + id;
      this.http.getData(url).subscribe((game) => {
        if (game) {
          let gameState: GameState = game;
          if (gameState.playersNames.includes(this.auth.getAuth().user)) {
            //if played already
            this.initGame(gameState);
          } else {
            if (gameState.gameMulti) {
              //if multiplayer
              if (gameState.playersNames.includes('')) {
                //if empty slot
                if (gameState.playersNames[0] === '') {
                  gameState.playersNames[0] = this.auth.getAuth().user;
                } else {
                  gameState.playersNames[1] = this.auth.getAuth().user;
                }
                this.initGame(gameState);
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
    this.initVar(game);
    this.signalRService.startConnection();
    this.signalRService.addGameStateListener();
    this.signalRService.broadcastGameState();
  }

  public fireTorpedo(j: number, k: number) {
    alert('attacked: ' + j + '/' + k);
    //todo: check for valid hit
    //todo: check for ship being hit
  }

  private initVar(game: GameState): void {
    this.gameStatus = game.gameStage;
    this.whoseTurn = game.gameTurnPlayer;
    this.gameTurnNumber = game.gameTurnNumber;
    this.player1 = game.playersDisplay[0];
    this.player2 = game.playersDisplay[1];
    this.boardP1 = game.boardP1;
    this.boardP2 = game.boardP2;
  }

  public onBack(): void {
    this.router.navigate(['']);
  }
}
