import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  constructor(private http: HttpClient, public auth: AuthService) { }

  ngOnInit(): void {
    this.executeCall()
  }

  executeCall(): void {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'bearer ' + this.auth.getAuth()!.token
      })
    };

    console.log('executing call');
    var url = 'http://localhost:50962/' + 'api/user/test';
    this.http.get<string>(url, httpOptions)
      .subscribe(
        (val) => {
          console.log("POST call successful value returned in body", val);
        },
        response => {
          console.log("POST call in error", response);
          //todo: popup
        },
        () => {
          console.log("The POST observable is now completed.");
          //todo: popup
        });
  }
}
