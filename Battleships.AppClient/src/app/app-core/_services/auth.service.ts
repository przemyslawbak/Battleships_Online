import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { LoginResponse } from '@models/login-response.model';
import { HttpService } from './http.service';
import { HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authKey = 'auth';

  constructor(private router: Router, private http: HttpService) {}

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
    console.log(user);
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
    return token.replace(/\$/g, '/').replace(/\@/g, '=');
  }

  public setExternalAuth(user: LoginResponse) {
    this.setAuth(user);
  }

  public logout() {
    const data = {
      UserName: this.getAuth().user,
      RefreshToken: this.getAuth().refreshToken,
      Token: this.getAuth().token,
    };
    this.http.postRevokeData(data).subscribe(() => {
      this.stopRefreshTokenTimer();
      this.setAuth(null);
      this.router.navigate(['']);
    });
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
    if (this.getAuth().role === 'Admin') {
      return true;
    }

    return false;
  }

  public isLoggedIn(): boolean {
    if (this.getAuth()) {
      return true;
    }

    return false;
  }

  public isRoleCorrect(
    route: ActivatedRouteSnapshot,
    user: LoginResponse
  ): boolean {
    if (route.data.roles && route.data.roles.indexOf(user.role) === -1) {
      return false;
    }

    return true;
  }

  //helper methods

  private refreshTokenTimeout;

  private startRefreshTokenTimer() {
    const timeTokenExpires =
      JSON.parse(atob(this.getAuth().token.split('.')[1])).exp * 1000;
    const timeNow = Date.now();
    const timeout = timeTokenExpires - timeNow - 60000;
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
