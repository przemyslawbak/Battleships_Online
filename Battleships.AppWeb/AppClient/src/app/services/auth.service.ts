import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

import { TokenResponse } from "../models/token.response";

@Injectable()
export class AuthService {
  authKey: string = "auth";

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: any) {
  }
  // performs the login
  login(username: string, password: string): Observable<boolean> {
    var url = 'http://localhost:50962/' + "api/token/auth";
    var data = {
      username: username,
      password: password,
      // required when signing up with username/password
      grant_type: "password",
      // space-separated list of scopes for which the token is issued
      scope: "offline_access profile email"
    };
    return this.http.post<TokenResponse>(url, data)
      .pipe(
        map((res) => {
        let token = res && res.token;
        // if the token is there, login has been successful
        if (token) {
          // store username and jwt token
          this.setAuth(res);
          // successful login
          return true;
        }
        // failed login
        return false;
      }))
  }

  logout(): boolean {
    this.setAuth(null);
    return true;
  }

  // Persist auth into localStorage or removes it if a NULL argument is given
  setAuth(auth: TokenResponse | null): boolean {
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
  getAuth(): TokenResponse | null {
    if (isPlatformBrowser(this.platformId)) {
      var i = localStorage.getItem(this.authKey);
      if (i) {
        return JSON.parse(i);
      }
    }
    return null;
  }
  // Returns TRUE if the user is logged in, FALSE otherwise.
  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.authKey) != null;
    }
    return false;
  }

  isTokenExpired() {
    const token = this.getAuth().token;
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }
}
