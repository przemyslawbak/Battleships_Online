import { Component, Inject, OnInit, NgZone, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { AuthService } from '../services/auth.service';
import { TokenResponse } from "../models/token.response";
import { map } from 'rxjs/operators';

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

  constructor(private http: HttpClient, private router: Router, private auth: AuthService, private zone: NgZone, @Inject(PLATFORM_ID) private platformId: any) { }

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
    this.externalProviderWindow.addEventListener("message", this.handleMessage.bind(this), false);
  }

  private handleMessage(event: Event) {
    console.log('event occured');
    const message = event as MessageEvent;

    if (message.origin !== "http://localhost:50962" || message.data === "") {
      console.log('message.origin corrupted');
      return
    };

    this.externalProviderWindow.close();

    const result = <TokenResponse>JSON.parse(message.data);
    console.log(result.email);
    //todo: fail
    //todo: ok
  }

  private closePopUpWindow() {
    if (this.externalProviderWindow) {
      this.externalProviderWindow.close();
    }
    this.externalProviderWindow = null;
  }
}
