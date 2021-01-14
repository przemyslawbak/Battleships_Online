import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LoginResponse } from '@models/login-response.model';
import { HttpService } from './http.service';
import { HttpRequest } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authKey = 'auth';

  constructor(private router: Router, private http: HttpService) {}

  public getAuth(): LoginResponse | null {
    const i = localStorage.getItem(this.authKey);
    if (i) {
      return JSON.parse(i);
    }
    return null;
  }

  public setAuth(user: LoginResponse | null) {
    if (user) {
      user.token = user.token.replace(/\$/g, '/').replace(/\@/g, '=');
      user.refreshToken = this.correctRefreshToken(user.refreshToken);
      localStorage.setItem(this.authKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.authKey);
    }
  }

  private correctRefreshToken(refreshToken: string): string {
    return refreshToken.replace(/\$/g, '/').replace(/\@/g, '=');
  }

  public setExternalAuth(res: LoginResponse) {
    console.log('setExternalAuth');
    this.setAuth(res);
    this.startRefreshTokenTimer();
  }

  public addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const user = this.getAuth();
    if (user) {
      request = this.http.addAuthHeader(request, user.token);
    }

    return request;
  }

  public login(email: string, password: string) {
    const data = {
      Email: email,
      Password: password,
      GrantType: 'password',
    };
    return this.http.postForLoginResponse(data).pipe(
      map((user) => {
        this.setAuth(user);
        this.startRefreshTokenTimer();
        return user;
      })
    );
  }

  public logout() {
    const data = {
      UserName: this.getAuth().user,
      RefreshToken: this.getAuth().refreshToken,
      Token: this.getAuth().token,
    };
    this.http.postRevokeData(data).subscribe((res) => {
      this.stopRefreshTokenTimer();
      this.setAuth(res);
      this.router.navigate(['']);
    });
  }

  public refreshToken() {
    const data = {
      Email: this.getAuth().email,
      RefreshToken: this.getAuth().refreshToken,
    };
    return this.http.postForRefreshToken(data).pipe(
      map((user) => {
        alert('refresh');
        this.setAuth(user);
        this.startRefreshTokenTimer();
        return user;
      })
    );
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
    this.refreshTokenTimeout = setTimeout(
      () => this.refreshToken().subscribe((res) => this.setAuth(res)),
      timeout
    );
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
