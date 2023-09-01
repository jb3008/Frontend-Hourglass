import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from './utils';

@Injectable()
export class ErrorCatchingInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog, private utils: Utils) {}
  showErrorPopup(msg: string) {
    this.utils.showDialog(this.dialog, msg, (res: any) => {});
  }
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // console.log('Passed through the interceptor in request');

    return next.handle(request).pipe(
      map((res) => {
        // console.log('Passed through the interceptor in response');
        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';
        if (error.error instanceof ErrorEvent) {
          // console.log('This is client side error');
          errorMsg = `${error.error.message}`;
        } else {
          // console.log('This is server side error');
          errorMsg = `jayesh${error.message}`;
        }
        console.log(errorMsg);
        // this.showErrorPopup(errorMsg);
        return throwError(errorMsg);
      })
    );
  }
}
