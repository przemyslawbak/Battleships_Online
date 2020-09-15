import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TokenResponse } from "../models/token.response";
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-close',
  templateUrl: './close.component.html',
  styleUrls: ['./close.component.css']
})
export class CloseComponent implements OnInit {
  tokenResponse: TokenResponse;

  constructor(private route: ActivatedRoute, private auth: AuthService) { }

  ngOnInit(): void {
    this.tokenResponse = this.getTokenResponse();
    if (this.tokenResponse) {
      this.auth.setAuth(this.tokenResponse);
      parent.window.opener.postMessage('', 'http://localhost:4200');
    } else {
      //todo: message that error
    }
  }

  getTokenResponse(): TokenResponse {
    const email = this.route.snapshot.paramMap.get('email');
    const user = this.route.snapshot.paramMap.get('user');
    const token = this.route.snapshot.paramMap.get('token');
    const refresh = this.route.snapshot.paramMap.get('refresh');

    var model = <TokenResponse>{};
    model.email = email;
    model.displayName = user;
    model.user = user;
    model.token = token;
    model.refreshToken = refresh;

    return model;
  }

}
