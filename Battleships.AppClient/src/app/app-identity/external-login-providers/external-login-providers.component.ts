import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '@environments/environment';

import { LoginResponse } from '@models/login-response.model';

import { AuthService } from '@services/auth.service';
import { ModalService } from '@services/modal.service';

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
    private router: Router,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private modalService: ModalService,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.closePopUpWindow();
  }

  public callExternalLogin(providerName: string) {
    this.spinner.show();
    const url = environment.apiUrl + 'api/token/external-login/' + providerName;

    const w = screen.width >= 1050 ? 1050 : screen.width;
    const h = screen.height >= 550 ? 550 : screen.height;
    const params =
      'toolbar=yes,scrollbars=yes,resizable=yes,width=' + w + ', height=' + h;

    this.closePopUpWindow();
    this.externalProviderWindow = window.open(
      url,
      'ExternalProvider',
      params,
      false
    );
    let html =
      '<!doctype html>\
<html lang="en">\
<head>\
    <style>\
        .wait {\
          margin-left: auto;\
              margin-right: auto;\
              margin-top: 30px;\
              display:block;\
              width: 210px;\
              font-size: 20px;\
        }\
        .loader {\
          margin-left: auto;\
          margin-right: auto;\
              margin-top: 30px;\
            border: 16px solid #f3f3f3;\
            border-radius: 50%;\
            border-top: 16px solid #3498db;\
            width: 120px;\
            height: 120px;\
            -webkit-animation: spin 2s linear infinite; /* Safari */\
            animation: spin 2s linear infinite;\
        }\
\
        /* Safari */\
        @-webkit-keyframes spin {\
            0% {\
                -webkit-transform: rotate(0deg);\
            }\
\
            100% {\
                -webkit-transform: rotate(360deg);\
            }\
        }\
\
        @keyframes spin {\
            0% {\
                transform: rotate(0deg);\
            }\
\
            100% {\
                transform: rotate(360deg);\
            }\
        }\
    </style>\
    <meta charset="utf-8">\
    <title>External Login</title>\
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\
</head>\
<body>\
    <div class="loader"></div>\
    <div class="wait"/>\
        Please wait, redirecting to ' +
      providerName +
      '...\
    </div>\
</body>\
</html>';
    this.externalProviderWindow.document.body.innerHTML = html;
    const checkIntervalId = setInterval(() => {
      if (this.externalProviderWindow.closed) {
        this.auth.startRefreshTokenTimer();
        clearInterval(checkIntervalId);
        this.handleCloseExternalProvider();
      } else {
        // still open, do nothing
      }
    }, 1000);
  }

  private handleCloseExternalProvider() {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl);
      this.closePopUpWindow();
    } else {
      this.modalService.open(
        'info-modal',
        'Something went wrong. Please try again.'
      );
      this.router.navigate(['join-site']);
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
