import { Injectable } from '@angular/core';

@Injectable()
export class TextService {
  constructor() {}

  public getErrorMessage(error: any): string {
    return error.error == null ? 'Unknown error.' : error.error;
  }

  public splitToken(token: string): string {
    return token.split('.')[1];
  }

  public replaceSpecialCharacters(token: string): string {
    return token.replace(/\$/g, '/').replace(/\@/g, '=');
  }
}
