import { HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { SecurityService } from './security.service';

@Injectable()
export class ErrorService {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );
  constructor(
    private modalService: ModalService,
    private auth: AuthService,
    private router: Router,
    private securityService: SecurityService
  ) {}

  public handleBackendError(error: any) {
    error.error = 'Back-end server problems.';
    this.genericErrorHandler(error);
  }

  public handleOtherError(error: any) {
    this.securityService.delayForBruteForce(10);
    this.genericErrorHandler(error);
  }

  public handleBotError(error: any) {
    this.securityService.delayForBruteForce(10);
    this.genericErrorHandler(error);
  }

  public handleAuthError(
    error: any,
    next: HttpHandler,
    request: HttpRequest<any>
  ): void {
    if (this.auth.isLoggedIn()) {
      const accessExpired = this.auth.isTokenExpired();
      if (accessExpired) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);

          this.tryGetRefreshTokenService().pipe(
            switchMap((authResult: boolean) => {
              this.isRefreshing = false;
              if (authResult) {
                this.refreshTokenSubject.next(authResult);
                const modifiedRequest = this.auth.addAuthHeader(request);
                return next.handle(modifiedRequest);
              } else {
                this.auth.logout();
              }
            })
          );
        } else {
          this.refreshTokenSubject.pipe(
            filter((authResult) => authResult != null),
            take(1),
            switchMap(() => {
              const modifiedRequest = this.auth.addAuthHeader(request);
              return next.handle(modifiedRequest);
            })
          );
        }
      } else {
        next.handle(this.auth.addAuthHeader(request));
      }
    } else {
      this.router.navigate(['join-site']);
    }
  }

  private genericErrorHandler(error: any) {
    this.modalService.open('info-modal', error.error);
  }

  protected tryGetRefreshTokenService(): Observable<boolean> {
    var subject = new Subject<boolean>();
    this.auth.refreshToken().subscribe((res) => subject.next(res));

    return subject.asObservable();
  }
}
