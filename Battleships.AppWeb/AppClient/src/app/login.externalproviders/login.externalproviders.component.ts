import { Component, Inject, OnInit, NgZone, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from "@angular/common/http";
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
  externalProviderWindow: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    // inject the local zone
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: any) {
  }
  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // close previously opened windows (if any)
    this.closePopUpWindow();
    // instantiate the externalProviderLogin function
    // (if it doesn't exist already)
    var self = this;
    if (!window.externalProviderLogin) {
      window.externalProviderLogin = function (auth: TokenResponse) {
        self.zone.run(() => {
          console.log("External Login successful!");
          self.authService.setAuth(auth);
          self.router.navigate([""]);
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
    alert('dupa'); //todo: lock for the window time being (somehow)
  }

  private closePopUpWindow() {
    if (this.externalProviderWindow) {
      this.externalProviderWindow.close();
    }
    this.externalProviderWindow = null;
  }
}
