import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoginResponse } from '@models/login-response.model';

import { AuthService } from '@services/auth.service';

@Component({
  templateUrl: './close-external-login.component.html',
  styleUrls: ['./close-external-login.component.css'],
})
export class CloseComponent implements OnInit {
  constructor(private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit(): void {
    let loginResponse = this.getTokenResponse();
    this.auth.setAuth(loginResponse);
    this.auth.startRefreshTokenTimer();

    parent.window.close();
  }

  @HostListener('window:unload', ['$event'])
  public unloadHandler() {
    parent.window.close();
  }

  private getTokenResponse(): LoginResponse {
    const email = this.route.snapshot.paramMap.get('email');
    const user = this.route.snapshot.paramMap.get('user');
    const token = this.route.snapshot.paramMap.get('token');
    const refresh = this.route.snapshot.paramMap.get('refresh');
    const display = this.route.snapshot.paramMap.get('display');

    const model = {} as LoginResponse;
    model.email = email;
    model.displayName = display;
    model.user = user;
    model.token = token;
    model.refreshToken = refresh;

    return model;
  }
}
