import { Injectable } from '@angular/core';
import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ErrorService } from '@services/error.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private error: ErrorService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<any> {
    return next.handle(request).pipe(
      catchError((error) => {
        return this.handleResponseError(error, request, next);
      })
    );
  }

  private handleResponseError(
    error: any,
    request: HttpRequest<any>,
    next: HttpHandler
  ): any {
    if (request.url.indexOf('refresh') !== -1) {
      return next.handle(request);
    }

    if (error.status === 0) {
      this.error.handleBackendError(error);
    } else if (error.status === 401 || error.status === 403) {
      this.error.handleAuthError(error, next, request);
    } else if (error.status === 429) {
      this.error.handleBotError(error);
    } else {
      this.error.handleOtherError(error);
    }
  }
}
