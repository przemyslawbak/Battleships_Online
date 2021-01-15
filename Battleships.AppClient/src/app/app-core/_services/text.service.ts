import { Injectable } from '@angular/core';

@Injectable()
export class TextService {
  constructor() {}

  public getErrorMessage(error: any): string {
    return error.error == null ? 'Unknown error.' : error.error;
  }
}
