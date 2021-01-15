import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';

import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';

@Component({
  templateUrl: './user-test-auth.component.html',
  styleUrls: ['./user-test-auth.component.css'],
})
export class TestComponent implements OnInit {
  constructor(private http: HttpService, public auth: AuthService) {}

  ngOnInit(): void {
    this.executeCall();
  }

  executeCall(): void {
    /*
    const url = environment.apiUrl + 'api/user/test';
    this.http.getTestData(url).subscribe((val) => {
      //.log('POST call successful value returned in body', val);
    });
    */
  }
}
