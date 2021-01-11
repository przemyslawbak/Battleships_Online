import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '@services/auth.service';

@Injectable()
export class JtwInterceptor implements HttpInterceptor {
  constructor(public auth: AuthService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.auth.isLoggedIn()) {
      request = this.auth.addAuthHeader(request);
    }

    return next.handle(request);
  }
}
