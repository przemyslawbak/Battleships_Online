import { BoardService } from '@services/board.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { GameState } from '@models/game-state.model';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { SignalRService } from '@services/signal-r.service';
import { GameService } from '@services/game.service';
import { AuthService } from '@services/auth.service';
import { Player } from '@models/player.model';
import { FleetService } from '@services/fleet.service';

@Component({
  templateUrl: './game-start.component.html',
  styleUrls: ['./game-start.component.css'],
})
export class GameStartComponent implements OnInit {
  public name: string = 'Player';
  public form: FormGroup;
  public disabledChecks: boolean;
  public multiplayer: boolean = false;
  private speedDivider: number = 1;
  private difficulty: string = 'easy';
  private open: boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private game: GameService,
    private signalRService: SignalRService,
    public auth: AuthService,
    private board: BoardService,
    private fleet: FleetService
  ) {
    this.createForm();
  }

  get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.name = this.auth.getAuth().displayName;
  }

  private createForm() {
    this.disabledChecks = true;
    this.form = this.formBuilder.group({
      gameMode: new FormControl('single', Validators.required),
      gameSpeed: new FormControl('slow', Validators.required),
      gameOpen: new FormControl('open'),
      gameDifficulty: new FormControl('easy'),
    });
  }

  public onBack() {
    this.router.navigate(['']);
  }

  public onChangeMode(e: any): void {
    if (e.target.value == 'multi') {
      this.multiplayer = true;
    } else {
      this.multiplayer = false;
    }
  }

  public onChangeSpeed(e: any): void {
    if (e.target.value == 'slow') {
      this.speedDivider = 1;
    } else if (e.target.value == 'moderate') {
      this.speedDivider = 2;
    } else if (e.target.value == 'fast') {
      this.speedDivider = 3;
    }
  }

  public onChangeDifficulty(e: any): void {
    this.difficulty = e.target.value;
  }

  public onChangeJoining(e: any): void {
    if (e.target.value == 'open') {
      this.open = true;
    } else {
      this.open = false;
    }
  }

  public onSubmit() {
    this.spinner.show();
    this.signalRService.stopConnection(false);
    this.game.setGame(null);
    let model = this.initGameStartState();
    const url = environment.apiUrl + 'api/game/start';
    this.http.post(url, model).subscribe(() => {
      this.spinner.hide();
      this.router.navigate(['connect-game/' + model.gameId]);
    });
  }

  private initGameStartState(): GameState {
    let player1: Player = {
      isMyTurn: true,
      isDeployed: false,
      fleet: this.fleet.createFleet(),
      board: this.board.getEmptyBoard(),
      displayName: '',
      userName: '',
    } as Player;
    let player2: Player = {
      isMyTurn: false,
      isDeployed: false,
      fleet: this.fleet.createFleet(),
      board: this.board.getEmptyBoard(),
      displayName: '',
      userName: '',
    } as Player;
    let model = {} as GameState;
    model.fireCol = -1;
    model.fireRow = -1;
    model.gameId = this.getUniqueId();
    model.gameTurnNumber = 1;
    model.gameTurnPlayer = 0;
    model.gameMulti = this.multiplayer;
    model.gameOpen = this.open;
    model.gameDifficulty = this.difficulty;
    model.gameSpeedDivider = this.speedDivider;
    model.players = [player1, player2];
    model.isDeploymentAllowed = false;
    model.isStartAllowed = false;
    model.displayingResults = false;
    model.fireResult = false;
    return model;
  }

  private getUniqueId(): number {
    let min = Math.ceil(100000000);
    let max = Math.floor(999999999);
    return Math.floor(Math.random() * (max - min) + min);
  }
}
