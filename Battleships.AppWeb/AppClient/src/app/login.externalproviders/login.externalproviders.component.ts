import { Component, Inject, OnInit, NgZone, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { Router } from "@angular/router";

import { AuthService } from '../services/auth.service';
import { TokenResponse } from "../models/token.response";

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

  constructor(private router: Router, private auth: AuthService, private zone: NgZone, @Inject(PLATFORM_ID) private platformId: any) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.closePopUpWindow();
    var self = this;
    if (!window.externalProviderLogin) {
      window.externalProviderLogin = function (auth: TokenResponse) {
        self.zone.run(() => {
          console.log("External Login successful!");
          self.auth.setAuth(auth);
          self.router.navigate(['']);
        });
      }
    }
  }

  public callExternalLogin(providerName: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
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
      console.log('logged in user with external provider: ' + this.auth.getAuth().user);
      this.router.navigate(['']);
      this.closePopUpWindow();
    } else {
      console.log('failed to logged in user with external provider');
      this.router.navigate(['join']);
    }
  }

  private closePopUpWindow() {
    if (this.externalProviderWindow) {
      this.externalProviderWindow.close();
    }
    this.externalProviderWindow = null;
  }
}
