import { Component, OnInit } from '@angular/core';

import { HttpService } from '@services/http.service';

import { BestPlayer } from '@models/best-players';
import { Router } from '@angular/router';

@Component({
  templateUrl: './game-best.component.html',
  styleUrls: ['./game-best.component.css'],
})
export class GameBestComponent implements OnInit {
  public playersList: BestPlayer[] = [];
  public note: string = 'Loading list...';

  constructor(private http: HttpService, private router: Router) {}

  public ngOnInit(): void {
    this.executeCall();
  }

  private executeCall(): void {
    this.http.getBestPlayers().subscribe((val: BestPlayer[]) => {
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
