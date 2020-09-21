import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from '../../../environments/environment';

import { AuthService } from '../../app-core/_services/auth.service';

@Component({
  templateUrl: './user-test-auth.component.html',
  styleUrls: ['./user-test-auth.component.css']
})
export class TestComponent implements OnInit {

  constructor(private http: HttpClient, public auth: AuthService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.executeCall()
  }

  executeCall(): void {
    this.spinner.show();
    let url = environment.apiUrl + 'api/user/test';
    this.http.get<string>(url)
      .subscribe(
        (val) => {
          console.log("POST call successful value returned in body", val);
          this.spinner.hide();
        });
  }
}
