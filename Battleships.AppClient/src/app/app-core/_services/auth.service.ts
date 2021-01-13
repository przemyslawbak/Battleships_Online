import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

import { LoginResponse } from '@models/login-response.model';
import { HttpService } from './http.service';

@Injectable()
export class AuthService {
  authKey = 'auth';

  constructor(private router: Router, private http: HttpService) {}

  public login(email: string, password: string): Observable<boolean> {
    const url = environment.apiUrl + 'api/token/auth';
    const data = {
      Email: email,
      Password: password,
      GrantType: 'password',
    };

    return this.getTokenResponse(url, data);
  }

  public addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.getAuth()!.token;
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return request;
  }

  public refreshToken(): Observable<boolean> {
    const url = environment.apiUrl + 'api/token/refresh-token';
    const data = {
      Email: this.getAuth().email,
      RefreshToken: this.getAuth().refreshToken,
    };
    return this.getTokenResponse(url, data);
  }

  public logout(): boolean {
    const data = {
      UserName: this.getAuth().user,
      RefreshToken: this.getAuth().refreshToken,
      Token: this.getAuth().token,
    };
    this.http.postRevokeData(data);
    this.setAuth(null);
    this.router.navigate(['']);
    return true;
  }

  public setAuth(auth: LoginResponse | null): void {
    if (auth) {
      auth.token = auth.token.replace(/\$/g, '/').replace(/\@/g, '=');
      auth.refreshToken = auth.refreshToken
        .replace(/\$/g, '/')
        .replace(/\@/g, '=');
      localStorage.setItem(this.authKey, JSON.stringify(auth));
    } else {
      localStorage.removeItem(this.authKey);
    }
  }

  public getAuth(): LoginResponse | null {
    const i = localStorage.getItem(this.authKey);
    if (i) {
      return JSON.parse(i);
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
    return localStorage.getItem(this.authKey) != null;
  }

  public isTokenExpired(): boolean {
    if (this.isLoggedIn()) {
      const token = this.getAuth().token;
      const expiry = JSON.parse(atob(token.split('.')[1])).exp;
      return Math.floor(new Date().getTime() / 1000) >= expiry;
    } else {
      return false;
    }
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

  private getTokenResponse(url: string, data: any): Observable<boolean> {
    return this.http.postLoginResponse(url, data).pipe(
      map((res: any) => {
        return this.isResponseCorrect(res);
      })
    );
  }

  private isResponseCorrect(res: any): any {
    const token = res && res.token;
    if (token) {
      this.setAuth(res);
      return true;
    }
    return false;
  }
}
