import { Injectable } from "@angular/core";
import { HttpHandler, HttpEvent, HttpInterceptor, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(public auth: AuthService, private router: Router) { }

  //if unauthorised logout
  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    if (err.status === 401 || err.status === 403) {
      console.log('received: unauthorised');
      this.auth.logout();
      this.router.navigate(['join']);
      return of(err.message);
    }
    return throwError(err);
  }

  //if logged in adding Authorization token
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var token = (this.auth.isLoggedIn()) ? this.auth.getAuth()!.token : null;
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request).pipe(
      catchError(x => this.handleAuthError(x))
    );
  }
}
