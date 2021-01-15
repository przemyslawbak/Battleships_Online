import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { LoginResponse } from '@models/login-response.model';
import { HttpService } from './http.service';
import { HttpRequest } from '@angular/common/http';
import { TextService } from './text.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authKey = 'auth';

  constructor(
    private router: Router,
    private http: HttpService,
    private text: TextService
  ) {}

  public login(email: string, password: string) {
    const data = {
      Email: email,
      Password: password,
      GrantType: 'password',
    };
    return this.http.postForLoginResponse(data).pipe(
      map((user) => {
        this.setAuth(user);
        return user;
      })
    );
  }

  public addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const user = this.getAuth();
    if (user) {
      request = this.http.addAuthHeader(request, user.token);
    }

    return request;
  }

  public getAuth(): LoginResponse | null {
    const i = localStorage.getItem(this.authKey);
    if (i) {
      let user: LoginResponse = JSON.parse(i);
      user.refreshToken = this.updateTokenCharacters(user.token);
      user.token = this.updateTokenCharacters(user.token);
      return JSON.parse(i);
    }
    return null;
  }

  public setAuth(user: LoginResponse | null) {
    if (user) {
      user.token = this.updateTokenCharacters(user.token);
      user.refreshToken = this.updateTokenCharacters(user.refreshToken);
      localStorage.setItem(this.authKey, JSON.stringify(user));
      this.startRefreshTokenTimer();
    } else {
      localStorage.removeItem(this.authKey);
    }
  }

  private updateTokenCharacters(token: string): string {
    return this.text.replaceSpecialCharacters(token);
  }

  public logout() {
    if (this.isLoggedIn()) {
      const data = {
        UserName: this.getAuth().user,
        RefreshToken: this.getAuth().refreshToken,
        Token: this.getAuth().token,
      };
      this.http.postRevokeData(data).subscribe((nullResult) => {
        this.setAuth(nullResult);
        this.stopRefreshTokenTimer();
        this.router.navigate(['']);
      });
    }
  }

  public refreshToken(): void {
    if (this.isLoggedIn()) {
      const data = {
        Email: this.getAuth().email,
        RefreshToken: this.getAuth().refreshToken,
      };
      this.http.postForRefreshToken(data).pipe(
        map((user) => {
          this.setAuth(user);
        })
      );
    }

    return null;
  }

  public isAdmin(): boolean {
    return this.getAuth().role == 'Admin' ? true : false;
  }

  public isLoggedIn(): boolean {
    return this.getAuth() ? true : false;
  }

  public isRoleCorrect(
    route: ActivatedRouteSnapshot,
    user: LoginResponse
  ): boolean {
    console.log(route);
    return route.data.roles.indexOf(user.role) === -1 ? false : true;
  }

  //helper methods

  private refreshTokenTimeout: NodeJS.Timeout;

  private startRefreshTokenTimer(): void {
    const timeTokenExpires =
      JSON.parse(atob(this.text.splitToken(this.getAuth().token))).exp * 1000;
    const timeNow = Date.now();
    const timeout = timeTokenExpires - timeNow - 60000;
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
  }

  private stopRefreshTokenTimer(): void {
    clearTimeout(this.refreshTokenTimeout);
  }
}
