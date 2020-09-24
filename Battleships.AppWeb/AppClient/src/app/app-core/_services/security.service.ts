import { Injectable } from '@angular/core';

import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class SecurityService {

  constructor(private spinner: NgxSpinnerService) { }

  public delayForBruteForce(seconds: number) {
    this.spinner.show();
    const milliseconds = 1000 * seconds;
    const currentTime = new Date().getTime();
    while (currentTime + milliseconds >= new Date().getTime()) {
    }
    this.spinner.hide();
  }
}
