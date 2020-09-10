import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

import { TokenResponse } from "../models/token.response";

@Injectable()
export class AuthService {
  authKey: string = "auth";

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: any) { }

  // performs the login
  public login(username: string, password: string): Observable<boolean> {
    var url = 'http://localhost:50962/' + "api/token/auth";
    var data = {
      username: username,
      password: password,
      grant_type: "password",
      scope: "offline_access profile email"
    };

    return this.getTokenResponse(url, data);
  }

  public refreshToken(): Observable<boolean> {
    var url = 'http://localhost:50962/' + "api/token/refresh-token";
    var data = {
      username: this.getAuth().user,
      refreshtoken: this.getAuth().refreshtoken
    };

    return this.getTokenResponse(url, data);
  }

  public logout(): boolean {
    console.log('logged out from auth service');
    var url = 'http://localhost:50962/' + "api/token/revoke-token";
    var data = {
      username: this.getAuth().user,
      refreshtoken: this.getAuth().refreshtoken,
      token: this.getAuth().token
    };
    console.log('revoke token post call');
    this.http.post<any>(url, data)
      .subscribe(
        () => {
          console.log('logged out');
        });
    this.setAuth(null);
    return true;
  }

  // Persist auth into localStorage or removes it if a NULL argument is given
  public setAuth(auth: TokenResponse | null): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (auth) {
        localStorage.setItem(
          this.authKey,
          JSON.stringify(auth));
      }
      else {
        localStorage.removeItem(this.authKey);
      }
    }
    return true;
  }

  // Retrieves the auth JSON object (or NULL if none)
  public getAuth(): TokenResponse | null {
    if (isPlatformBrowser(this.platformId)) {
      var i = localStorage.getItem(this.authKey);
      if (i) {
        return JSON.parse(i);
      }
    }
    return null;
  }
  // Returns TRUE if the user is logged in, FALSE otherwise.
  public isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.authKey) != null;
    }
    return false;
  }

  public isTokenExpired(): boolean {
    if (this.isLoggedIn()) {
      const token = this.getAuth().token;
      const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } else {
      return false;
    }
  }

  private getTokenResponse(url: string, data): Observable<boolean> {
    return this.http.post<TokenResponse>(url, data) //todo: DRY
      .pipe(
        map((res) => {
          let token = res && res.token;
          if (token) {
            this.setAuth(res);
            return true;
          }
          return false;
        }))
  }
}
