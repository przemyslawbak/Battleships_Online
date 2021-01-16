import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class TextService {
  constructor() {}

  //todo: test
  public getErrorMessage(error: HttpErrorResponse): string {
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
          return 'Validation Error!';

        default:
          return 'Unknown error.';
      }
    }
  }

  public splitToken(token: string): string {
    return token.split('.')[1];
  }

  public replaceSpecialCharacters(token: string): string {
    return token.replace(/\$/g, '/').replace(/\@/g, '=');
  }
}
