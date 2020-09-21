import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../environments/environment';

@Component({
  templateUrl: './admin-test-auth.component.html',
  styleUrls: ['./admin-test-auth.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private http: HttpClient, public auth: AuthService, private spinner: NgxSpinnerService) { }

  public ngOnInit(): void {
    this.executeCall()
  }

  private executeCall(): void {
    this.spinner.show();
    let url = environment.apiUrl + 'api/user/admin';
    this.http.get<string>(url)
      .subscribe(
        (val) => {
          console.log("POST call successful value returned in body", val);
          this.spinner.hide();
        });
  }
}
