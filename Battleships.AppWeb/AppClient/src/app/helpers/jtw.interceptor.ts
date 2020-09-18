import { Injectable } from "@angular/core";
import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from 'rxjs';

import { AuthService } from "../services/auth.service";

@Injectable()
export class JtwInterceptor implements HttpInterceptor {
  constructor(public auth: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (this.auth.isLoggedIn()) {
      request = this.auth.addAuthHeader(request);
    }

    return next.handle(request);
  }
}
