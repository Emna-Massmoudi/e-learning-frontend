import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Routes publiques → pas de token
  private readonly PUBLIC_ROUTES = [
    '/api/auth/',
    '/api/categories',
    '/api/cours'
  ];

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const isPublic = this.PUBLIC_ROUTES.some(route => req.url.includes(route));
    const token = localStorage.getItem('token');

    let clonedRequest = req;

    if (token && !isPublic) {
      clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}