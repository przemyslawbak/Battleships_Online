import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { NgxSpinnerService } from "ngx-spinner";

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  constructor(private http: HttpClient, public auth: AuthService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.executeCall()
  }

  executeCall(): void {
    this.spinner.show();
    console.log('executing call, token:' + this.auth.getAuth()!.token);
    console.log('executing call, refresh token:' + this.auth.getAuth()!.refreshToken);
    var url = 'http://localhost:50962/' + 'api/user/test';
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
