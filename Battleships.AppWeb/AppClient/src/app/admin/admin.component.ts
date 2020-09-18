import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private http: HttpClient, public auth: AuthService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.executeCall()
  }

  executeCall(): void {
    this.spinner.show();
    console.log('executing admin auth call, token:' + this.auth.getAuth()!.token);
    console.log('executing admin auth call, refresh token:' + this.auth.getAuth()!.refreshToken);
    var url = 'http://localhost:50962/' + 'api/user/admin';
    this.http.get<string>(url)
      .subscribe(
        (val) => {
          console.log("POST call successful value returned in body", val);
          this.spinner.hide();
        },
        response => {
          console.log("POST call in error", response);
          this.spinner.hide();
        },
        () => {
          console.log("The POST observable is now completed.");
          this.spinner.hide();
        });
  }
}
