import {
  HttpErrorResponse,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { SecurityService } from './security.service';

@Injectable()
export class ErrorService {
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

  public handleOtherError(error: HttpErrorResponse) {
    this.securityService.delayForBruteForce(10);
    this.genericErrorHandler(error);
  }

  public handleBotError(error: HttpErrorResponse) {
    this.securityService.delayForBruteForce(10);
    this.genericErrorHandler(error);
  }

  public handleAuthError(error: HttpErrorResponse): void {
    if (this.auth.isLoggedIn()) {
      this.securityService.delayForBruteForce(1); //todo: set 10
      this.genericErrorHandler(error);
    } else {
      this.router.navigate(['join-site']);
    }
  }

  private genericErrorHandler(error: HttpErrorResponse) {
    this.modalService.open('info-modal', error.error);
  }
}
