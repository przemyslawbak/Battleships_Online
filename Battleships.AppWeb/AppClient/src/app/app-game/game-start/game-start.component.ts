import { BoardService } from '@services/board.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GameState } from '@models/game-state.model';
import { environment } from '@environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SignalRService } from '@services/signal-r.service';
import { GameService } from '@services/game.service';
import { AuthService } from '@services/auth.service';
import { Player } from '@models/player.model';
import { FleetService } from '@services/fleet.service';
import { HttpService } from '@services/http.service';

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
    private http: HttpService,
    private game: GameService,
    private signalRService: SignalRService,
    public auth: AuthService,
    private board: BoardService,
    private fleet: FleetService
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
    this.signalRService.stopConnection(false);
    this.game.setGame(null);
    let model = this.initGameStartState();
    const url = environment.apiUrl + 'api/game/start';
    this.http.postData(url, model).subscribe(() => {
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
    model.gameAi = this.form.value.GameAi;
    model.gameMulti = this.form.value.GameMulti;
    model.gameLink = this.form.value.GameLink;
    model.gameOpen = this.form.value.GameOpen;
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
