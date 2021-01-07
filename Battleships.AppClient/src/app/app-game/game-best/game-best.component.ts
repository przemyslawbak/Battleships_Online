import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';

import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';

import { BestPlayer } from '@models/best-players';
import { Router } from '@angular/router';

@Component({
  templateUrl: './game-best.component.html',
  styleUrls: ['./game-best.component.css'],
})
export class GameBestComponent implements OnInit {
  public playersList: Array<BestPlayer> = [];
  public note: string = 'Loading list...';

  constructor(
    private http: HttpService,
    public auth: AuthService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.executeCall();
  }

  private executeCall(): void {
    const url = environment.apiUrl + 'api/user/best';
    this.http.getData(url).subscribe((val) => {
      this.playersList = val;
      if (this.playersList.length == 0 || !this.playersList) {
        this.note = 'No players found!';
      }
    });
  }

  public onBack() {
    this.router.navigate(['']);
  }
}
