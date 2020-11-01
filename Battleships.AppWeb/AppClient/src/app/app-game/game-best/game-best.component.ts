import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '@environments/environment';

import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';

import { BestPlayer } from '@models/best-players';

@Component({
  templateUrl: './game-best.component.html',
  styleUrls: ['./game-best.component.css'],
})
export class GameBestComponent implements OnInit {
  public playersList: Array<BestPlayer>;

  constructor(
    private http: HttpService,
    public auth: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  public ngOnInit(): void {
    this.executeCall();
  }

  private executeCall(): void {
    this.spinner.show();
    const url = environment.apiUrl + 'api/user/best';
    this.http.getData(url).subscribe((val) => {
      this.playersList = val;
    });
    this.spinner.hide();
  }
}
