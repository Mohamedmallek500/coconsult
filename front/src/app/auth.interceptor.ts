import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthServiceService } from 'src/services/auth-service.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthServiceService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip interceptor for login, register, and refresh token endpoints
    const authEndpoints = ['/api/auth/signin', '/api/auth/signup', '/api/auth/refreshtoken'];
    if (authEndpoints.some(endpoint => req.url.includes(endpoint))) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/api/auth/refreshtoken')) {
          return this.authService.refreshToken().pipe(
            switchMap(() => next.handle(req)), // Retry the original request
            catchError(() => {
              this.authService.logout().subscribe(); // Logout if refresh fails
              return throwError(() => new Error('Session expirée, veuillez vous reconnecter'));
            })
          );
        }
        let message = 'Une erreur est survenue';
        if (error.error?.message) {
          message = error.error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }
}