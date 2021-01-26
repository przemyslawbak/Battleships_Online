import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '@environments/environment';

import { AuthService } from '@services/auth.service';
import { TextService } from '@services/text.service';
import { WindowService } from '@services/window.service';

declare let window: any;

@Component({
  selector: 'external-login-providers',
  templateUrl: './external-login-providers.component.html',
  styleUrls: ['./external-login-providers.component.css'],
})
export class LoginExternalProvidersComponent implements OnInit {
  private externalProviderWindow: Window;
  private returnUrl: string;

  constructor(
    private windows: WindowService,
    private text: TextService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute
  ) {}

  //todo: test below

  public ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  public callExternalLogin(providerName: string) {
    this.spinner.show();
    const url = this.text.getExtarnalLoginUrl(providerName);
    const params = this.text.getWindowParameters();
    const html: string = this.text.getExternalLoginPageHtmlCode(providerName);
    this.windows.closePopUpWindow(this.externalProviderWindow);
    this.externalProviderWindow = this.windows.openExternalLoginWindow(
      this.externalProviderWindow,
      params,
      html,
      window,
      url
    );

    const checkIntervalId: NodeJS.Timeout = setInterval(() => {
      if (this.externalProviderWindow.closed) {
        clearInterval(checkIntervalId);
        this.windows.handleCloseExternalProvider(
          this.returnUrl,
          this.externalProviderWindow
        );
        this.spinner.hide();
      } else {
        //wait
      }
    }, 1000);
  }
}
