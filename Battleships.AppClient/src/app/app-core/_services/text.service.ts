import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable()
export class TextService {
  constructor() {}

  public getErrorMessageText(error: HttpErrorResponse): string {
    if (error != null) {
      switch (error.status) {
        case 400:
          return 'Bad Request.';

        case 404:
          return 'The requested resource does not exist.';

        case 412:
          return 'Precondition Failed.';

        case 500:
          return 'Internal Server Error.';

        case 503:
          return 'The requested service is not available.';

        case 422:
          return 'Validation Error.';

        default:
          return 'Unknown error. Please try again.';
      }
    }
  }

  public splitToken(token: string): string {
    return token.split('.')[1];
  }

  public replaceSpecialCharacters(token: string): string {
    return token.replace(/\$/g, '/').replace(/\@/g, '=');
  }

  //todo: test below

  public copyLink(gameLink: string) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', gameLink);
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }

  public getIdFromElementName(name: string): string {
    return name.split('-')[0];
  }

  public getFacebookShareLink(gameLink: string): string {
    return 'https://www.facebook.com/sharer/sharer.php?u=' + gameLink;
  }

  public getExternalLoginPageHtmlCode(providerName: string): string {
    return (
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
</html>'
    );
  }

  public getWindowParameters() {
    const width = screen.width >= 1050 ? 1050 : screen.width;
    const height = screen.height >= 550 ? 550 : screen.height;
    return (
      'toolbar=yes,scrollbars=yes,resizable=yes,width=' +
      width +
      ', height=' +
      height
    );
  }

  public getExtarnalLoginUrl(providerName: string) {
    return environment.apiUrl + 'api/token/external-login/' + providerName;
  }
}
