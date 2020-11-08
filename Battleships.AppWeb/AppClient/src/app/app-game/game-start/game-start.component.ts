import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GameState } from '@models/game-state.model';
import { GameStage } from '@models/game-state.model';
import { WhoseTurn } from '@models/game-state.model';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { GameService } from '@services/game.service';

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
    private game: GameService
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
    let model = this.initGameModel();
    this.game.setGame(model);
    const url = environment.apiUrl + 'api/game/start';
    this.http.post(url, model).subscribe(() => {
      this.spinner.hide();
      this.router.navigate(['play']);
    });
  }

  private initGameModel(): GameState {
    let model = {} as GameState;
    model.gameId = this.getUniqueId();
    model.gameAi = this.form.value.GameAi;
    model.gameMulti = this.form.value.GameMulti;
    model.gameLink = this.form.value.GameLink;
    model.gameOpen = this.form.value.GameOpen;
    model.gameStage = GameStage.Deploying;
    model.gameTurnPlayer = WhoseTurn.Guest;
    model.gameTurnNumber = 0;
    model.player1Fleet = this.createFleet();
    model.player2Fleet = this.createFleet();
    return model;
  }

  private getUniqueId(): number {
    let min = Math.ceil(10000000000);
    let max = Math.floor(99999999999);
    return Math.floor(Math.random() * (max - min) + min);
  }

  private createFleet(): boolean[][] {
    return [
      [false],
      [false],
      [false],
      [false],
      [false, false],
      [false, false],
      [false, false],
      [false, false, false],
      [false, false, false],
      [false, false, false, false],
    ];
  }
}
