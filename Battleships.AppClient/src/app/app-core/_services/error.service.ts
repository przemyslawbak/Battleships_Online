import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
  ) {
    this.securityService.delayForBruteForce(10);
  }

  public handleBackendError(error: any): void {
    error.error = 'Back-end server problems.';
    this.modalService.displayErrorMessage(error);
  }

  public handleOtherError(error: HttpErrorResponse): void {
    this.modalService.displayErrorMessage(error);
  }

  public handleBotError(error: HttpErrorResponse): void {
    this.modalService.displayErrorMessage(error);
  }

  public handleAuthError(error: HttpErrorResponse): void {
    if (this.auth.isLoggedIn()) {
      this.modalService.displayErrorMessage(error);
    } else {
      this.router.navigate(['join-site']);
    }
  }
}
