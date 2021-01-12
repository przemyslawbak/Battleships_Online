import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';

import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';

@Component({
  templateUrl: './admin-test-auth.component.html',
  styleUrls: ['./admin-test-auth.component.css'],
})
export class AdminComponent implements OnInit {
  constructor(private http: HttpService, public auth: AuthService) {}

  public ngOnInit(): void {
    this.executeCall();
  }

  private executeCall(): void {
    /*
    const url = environment.apiUrl + 'api/user/admin';
    this.http.getAdminData(url).subscribe((val) => {
      console.log('GET call successful value returned in body', val);
    });
    */
  }
}
