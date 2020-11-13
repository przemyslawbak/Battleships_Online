import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';

import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';

import { OpenGames } from '@models/open-games';

@Component({
  templateUrl: './game-join.component.html',
  styleUrls: ['./game-join.component.css'],
})
export class GameJoinComponent implements OnInit {
  public gameList: Array<OpenGames>;

  constructor(private http: HttpService, public auth: AuthService) {}

  public ngOnInit(): void {
    this.executeCall();
  }

  private executeCall(): void {
    const url = environment.apiUrl + 'api/game/open';
    this.http.getData(url).subscribe((val) => {
      this.gameList = val;
    });
  }
}
