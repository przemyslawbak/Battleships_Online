import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

import { TokenResponse } from "../models/token.response";

import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

declare var window: any;
@Component({
  selector: "login-externalproviders",
  templateUrl: "./login.externalproviders.component.html",
  styleUrls: ['./login.externalproviders.component.css']
})
export class LoginExternalProvidersComponent implements OnInit {
  private externalProviderWindow: Window;
  failed: boolean;
  error: string;
  errorDescription: string;
  isRequesting: boolean;

  constructor(private router: Router, private auth: AuthService, @Inject(PLATFORM_ID) private platformId: any, private spinner: NgxSpinnerService, private modalService: ModalService) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.closePopUpWindow();
    if (!window.externalProviderLogin) {
      window.externalProviderLogin = function (auth: TokenResponse) {
        this.zone.run(() => {
          console.log("External Login successful!");
          this.auth.setAuth(auth);
          this.router.navigate(['']);
        });
      }
    }
  }

  public callExternalLogin(providerName: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.spinner.show();
    var url = 'http://localhost:50962/' + "api/token/external-login/" + providerName;

    var w = (screen.width >= 1050) ? 1050 : screen.width;
    var h = (screen.height >= 550) ? 550 : screen.height;
    var params = "toolbar=yes,scrollbars=yes,resizable=yes,width=" + w + ", height=" + h;

    this.closePopUpWindow();
    this.externalProviderWindow = window.open(url, "ExternalProvider", params, false);
    parent.window.addEventListener("message", this.handleCloseExternalProvider.bind(this), false);
  }

  private handleCloseExternalProvider() {
    if (this.auth.isLoggedIn()) {
      console.log('logged in user with external provider: ' + this.auth.getAuth()!.displayName);
      this.router.navigate(['']);
      this.closePopUpWindow();
    } else {
      console.log('failed to logged in user with external provider');
      this.modalService.open('info-modal', 'Something went wrong. Please try again.');
      this.router.navigate(['join']);
    }
    this.spinner.hide();
  }

  private closePopUpWindow() {
    if (this.externalProviderWindow) {
      this.externalProviderWindow.close();
    }
    this.externalProviderWindow = null;
  }
}
