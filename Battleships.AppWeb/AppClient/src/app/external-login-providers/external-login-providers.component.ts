import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from '../../environments/environment';

import { LoginResponse } from "../models/login-response.model";

import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

declare let window: any;

@Component({
  selector: "external-login-providers",
  templateUrl: "./external-login-providers.component.html",
  styleUrls: ['./external-login-providers.component.css']
})

export class LoginExternalProvidersComponent implements OnInit {
  private externalProviderWindow: Window;

  constructor(private router: Router, private auth: AuthService, @Inject(PLATFORM_ID) private platformId: any, private spinner: NgxSpinnerService, private modalService: ModalService) { }

  public ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.closePopUpWindow();
    if (!window.externalProviderLogin) {
      window.externalProviderLogin = function (auth: LoginResponse) {
        this.zone.run(() => {
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
    let url = environment.apiUrl + "api/token/external-login/" + providerName;

    let w = (screen.width >= 1050) ? 1050 : screen.width;
    let h = (screen.height >= 550) ? 550 : screen.height;
    let params = "toolbar=yes,scrollbars=yes,resizable=yes,width=" + w + ", height=" + h;

    this.closePopUpWindow();
    this.externalProviderWindow = window.open(url, "ExternalProvider", params, false);
    let checkIntervalId = setInterval(() => {
      if (this.externalProviderWindow.closed) {
        clearInterval(checkIntervalId);
        this.handleCloseExternalProvider();
      }
      else {
        //still open, do nothing
      }
    }, 1000);
  }

  private handleCloseExternalProvider() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['']);
      this.closePopUpWindow();
    } else {
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
