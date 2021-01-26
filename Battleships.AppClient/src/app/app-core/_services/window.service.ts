import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

@Injectable()
export class WindowService {
  constructor(
    private auth: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  //todo: test below

  public openExternalLoginWindow(
    externalProviderWindow: Window,
    params: string,
    html: string,
    window: Window,
    url: string
  ): Window {
    externalProviderWindow = window.open(
      url,
      'ExternalProvider',
      params,
      false
    );
    externalProviderWindow.document.body.innerHTML = html;

    return externalProviderWindow;
  }

  public handleCloseExternalProvider(
    returnUrl: string,
    externalProviderWindow: Window
  ) {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl(returnUrl);
      this.closePopUpWindow(externalProviderWindow);
    } else {
      this.modalService.open(
        'info-modal',
        'Something went wrong. Please try again.'
      );
      this.router.navigate(['join-site']);
    }
  }

  public closePopUpWindow(externalProviderWindow: Window) {
    if (externalProviderWindow) {
      externalProviderWindow.close();
    }
    externalProviderWindow = null;
  }
}
