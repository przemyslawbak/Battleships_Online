import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

import { SecurityService } from '@services/security.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { LoginResponse } from '@models/login-response.model';

@Injectable()
export class AuthService {
  authKey = 'auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router,
    private spinner: NgxSpinnerService,
    private securityService: SecurityService
  ) {}

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
    this.spinner.show();
    const url = environment.apiUrl + 'api/token/revoke-token';
    const data = {
      UserName: this.getAuth().user,
      RefreshToken: this.getAuth().refreshToken,
      Token: this.getAuth().token,
    };
    this.http.post<any>(url, data).subscribe(() => {
      this.spinner.hide();
      this.router.navigate(['']);
    });
    this.setAuth(null);
    return true;
  }

  public setAuth(auth: LoginResponse | null): boolean {
    if (isPlatformBrowser(this.platformId)) {
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
    return true;
  }

  public getAuth(): LoginResponse | null {
    if (isPlatformBrowser(this.platformId)) {
      const i = localStorage.getItem(this.authKey);
      if (i) {
        return JSON.parse(i);
      }
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
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.authKey) != null;
    }
    return false;
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

  private getTokenResponse(url: string, data): Observable<boolean> {
    this.spinner.show();
    return this.http.post<LoginResponse>(url, data).pipe(
      map((res) => {
        const token = res && res.token;
        if (token) {
          this.setAuth(res);
          this.spinner.hide();
          return true;
        }
        this.spinner.hide();
        return false;
      })
    );
  }
}
