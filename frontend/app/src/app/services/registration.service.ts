import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  SendRegistrationRequest,
  SendRegistrationResponse,
} from '../models/registration';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  private root = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private errorHandler(err: HttpErrorResponse) {
    if (err.error instanceof ErrorEvent) {
      console.error('A client-side error has occurred.', err.error.message);
    } else {
      console.error(
        `A server-side error has occurred.\nCode: ${err.status}\nBody:\n${err.error}`
      );
    }

    return throwError(
      'FailedRequestException: Failed to retrieve a successful response from the server.'
    );
  }

  sendRegistrationRequest(
    req: SendRegistrationRequest
  ): Observable<SendRegistrationResponse> {
    return this.http
      .post<SendRegistrationResponse>(
        `${this.root}/api/registration`,
        req,
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }
}
