import { ShipComponent } from './../game-ship/ship.component';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GameState } from '@models/game-state.model';
import { GameStage } from '@models/game-state.model';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { SignalRService } from '@services/signal-r.service';
import { GameService } from '@services/game.service';
import { AuthService } from '@services/auth.service';
import { Player } from '@models/player.model';
import { BoardCell } from '@models/board-cell.model';

@Component({
  templateUrl: './game-start.component.html',
  styleUrls: ['./game-start.component.css'],
})
export class GameStartComponent {
  public form: FormGroup;
  public disabledChecks: boolean;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private game: GameService,
    private signalRService: SignalRService,
    public auth: AuthService
  ) {
    this.createForm();
  }

  private createForm() {
    this.disabledChecks = true;
    this.form = this.formBuilder.group({
      GameAi: [true],
      GameMulti: [false],
      GameLink: [false],
      GameOpen: [false],
    });
  }

  public onBack() {
    this.router.navigate(['']);
  }

  public setGameAi() {
    if (this.form.value.GameAi) {
      this.form.value.GameMulti = false;
      this.disabledChecks = true;
      this.form.value.GameLink = false;
      this.form.value.GameOpen = false;
    } else {
      this.form.value.GameMulti = true;
      this.disabledChecks = false;
      this.setOneChecked();
    }
  }

  public setGameMulti() {
    if (this.form.value.GameMulti) {
      this.form.value.GameAi = false;
      this.disabledChecks = false;
      this.setOneChecked();
    } else {
      this.form.value.GameAi = true;
      this.disabledChecks = true;
      this.form.value.GameLink = false;
      this.form.value.GameOpen = false;
    }
  }

  public setGameOpen() {
    this.form.value.GameAi = false;
    if (this.form.value.GameOpen) {
      this.form.value.GameLink = false;
    } else {
      this.form.value.GameLink = true;
    }
    this.setOneChecked();
  }

  public setGameLink() {
    this.form.value.GameAi = false;
    if (this.form.value.GameLink) {
      this.form.value.GameOpen = false;
    } else {
      this.form.value.GameOpen = true;
    }
    this.setOneChecked();
  }

  private setOneChecked() {
    if (
      (this.form.value.GameLink == false &&
        this.form.value.GameOpen == false) ||
      (this.form.value.GameLink == true && this.form.value.GameOpen == true)
    ) {
      this.form.value.GameOpen = true;
      this.form.value.GameLink = false;
    }
  }

  public onSubmit() {
    this.spinner.show();
    this.signalRService.stopConnection();
    this.game.setGame(null);
    let model = this.initGameStartState();
    console.log(model);
    const url = environment.apiUrl + 'api/game/start';
    this.http.post(url, model).subscribe(() => {
      this.spinner.hide();
      this.router.navigate(['play-game/' + model.gameId]);
    });
  }

  private initGameStartState(): GameState {
    let player1: Player = {
      isMyTurn: true,
      isDeployed: false,
      fleet: this.createFleet(),
      board: this.getEmptyBoard(),
      displayName: this.auth.getAuth().displayName,
      userName: this.auth.getAuth().user,
    } as Player;
    let player2: Player = {
      isMyTurn: true,
      isDeployed: false,
      fleet: this.createFleet(),
      board: this.getEmptyBoard(),
      displayName: '',
      userName: '',
    } as Player;
    let model = {} as GameState;
    model.gameId = this.getUniqueId();
    model.gameAi = this.form.value.GameAi;
    model.gameMulti = this.form.value.GameMulti;
    model.gameLink = this.form.value.GameLink;
    model.gameOpen = this.form.value.GameOpen;
    model.gameStage = GameStage.Deploying;
    model.players = [player1, player2];
    model.isDeploymentAllowed = false;
    model.isStartAllowed = false;
    return model;
  }

  private getUniqueId(): number {
    let min = Math.ceil(100000000);
    let max = Math.floor(999999999);
    return Math.floor(Math.random() * (max - min) + min);
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

  private createFleet(): Array<ShipComponent> {
    return [
      { size: 4, top: 0, left: 0, deployed: false, rotation: 0 },
      { size: 3, top: 0, left: 0, deployed: false, rotation: 0 },
      { size: 3, top: 0, left: 0, deployed: false, rotation: 0 },
      { size: 2, top: 0, left: 0, deployed: false, rotation: 0 },
      { size: 2, top: 0, left: 0, deployed: false, rotation: 0 },
      { size: 2, top: 0, left: 0, deployed: false, rotation: 0 },
      { size: 1, top: 0, left: 0, deployed: false, rotation: 0 },
      { size: 1, top: 0, left: 0, deployed: false, rotation: 0 },
      { size: 1, top: 0, left: 0, deployed: false, rotation: 0 },
      { size: 1, top: 0, left: 0, deployed: false, rotation: 0 },
    ];
  }
}
