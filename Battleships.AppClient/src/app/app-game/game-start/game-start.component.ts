import { RandomizerService } from './../../app-core/_services/randomizer.service';
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
import { GameService } from '@services/game.service';
import { AuthService } from '@services/auth.service';
import { Player } from '@models/player.model';
import { FleetService } from '@services/fleet.service';
import { HttpService } from '@services/http.service';

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
  private difficulty: string = 'hard';
  private gameOpen: boolean = true;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpService,
    private game: GameService,
    public auth: AuthService,
    private board: BoardService,
    private fleet: FleetService,
    private random: RandomizerService
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
      gameDifficulty: new FormControl('hard'),
    });
  }

  public onBack() {
    this.router.navigate(['']);
  }

  public onChangeMode(e: any): void {
    this.multiplayer = this.game.getMultiplayerValue(e.target.value);
  }

  public onChangeSpeed(e: any): void {
    this.speedDivider = this.game.getSpeedDividerValue(e.target.value);
  }

  public onChangeDifficulty(e: any): void {
    this.difficulty = this.game.getDifficultyValue(e.target.value);
  }

  public onChangeJoining(e: any): void {
    this.gameOpen = this.game.getJoinTypeValue(e.target.value);
  }

  public onSubmit() {
    let model = this.initGameStartState();
    this.http.postGameState(model).subscribe(() => {
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
    model.gameId = this.random.getUniqueId();
    model.gameTurnNumber = 1;
    model.gameTurnPlayer = 0;
    model.gameMulti = this.multiplayer;
    model.gameOpen = this.gameOpen;
    model.gameDifficulty = this.difficulty;
    model.gameSpeedDivider = this.speedDivider;
    model.players = [player1, player2];
    model.isDeploymentAllowed = false;
    model.isStartAllowed = false;
    model.displayingResults = false;
    model.fireResult = false;
    return model;
  }
}
