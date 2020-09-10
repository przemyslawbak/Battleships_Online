import { Injectable } from "@angular/core";
import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from "rxjs/operators";

import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(public auth: AuthService, private router: Router) { }
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    var updatedRequest = this.addAuthHeader(request);
    return next.handle(updatedRequest)
      .pipe(
        catchError(error => {
          return this.handleResponseError(error, request, next);
        })
      );
  }

  handleResponseError(error: any, request: HttpRequest<any>, next: HttpHandler): any {
    if (request.url.indexOf('refresh') !== -1) {
      return next.handle(request);
    }

    if (error.status === 401 || error.status === 403) {
      if (this.auth.isLoggedIn()) {
        const accessExpired = this.auth.isTokenExpired();
        if (accessExpired) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.tryGetRefreshTokenService().pipe(
              switchMap((authResult: boolean) => {
                this.isRefreshing = false;
                if (authResult) {
                  this.refreshTokenSubject.next(authResult);
                  let modifiedRequest = this.addAuthHeader(request);
                  return next.handle(modifiedRequest);
                } else {
                  this.auth.logout();
                }
              }));
          } else {
            return this.refreshTokenSubject.pipe(
              filter(authResult => authResult != null),
              take(1),
              switchMap(() => {
                let modifiedRequest = this.addAuthHeader(request);
                return next.handle(modifiedRequest);
              }));
          }
        } else {
          return next.handle(this.addAuthHeader(request))
        }
      } else {
        this.router.navigate(['join']);
      }
    } else {
      //todo: handle other error
    }
  }

  protected tryGetRefreshTokenService(): Observable<boolean> {
    return this.auth.refreshToken();
  }

  addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    var token = (this.auth.isLoggedIn()) ? this.auth.getAuth()!.token : null;
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return request;
  }


}
