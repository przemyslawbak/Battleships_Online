import { Injectable } from "@angular/core";
import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from "rxjs/operators";

import { SecurityService } from "../services/security.service";
import { AuthService } from "../services/auth.service";
import { ModalService } from '../services/modal.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(public auth: AuthService, private router: Router, private spinner: NgxSpinnerService, private modalService: ModalService, private securityService: SecurityService) { }
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request)
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
                  let modifiedRequest = this.auth.addAuthHeader(request);
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
                let modifiedRequest = this.auth.addAuthHeader(request);
                return next.handle(modifiedRequest);
              }));
          }
        } else {
          return next.handle(this.auth.addAuthHeader(request))
        }
      } else {
        this.router.navigate(['join']);
      }
    } else if (error.status === 429) {
      this.securityService.delayForBruteForce(10);
      this.genericErrorHandler(error);
    } else {
      this.securityService.delayForBruteForce(10);
      this.genericErrorHandler(error);
    }
  }
  
  private genericErrorHandler(error: any) {
    this.modalService.open('info-modal', error.error);
    this.spinner.hide();
  }

  protected tryGetRefreshTokenService(): Observable<boolean> {
    return this.auth.refreshToken();
  }
}
