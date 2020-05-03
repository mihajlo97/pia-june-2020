import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  SendWorkerRegistrationRequest,
  SendWorkerRegistrationResponse,
  SendCompanyRegistrationRequest,
  SendCompanyRegistrationResponse,
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
      Accept: 'application/json',
    }),
  };
  private root = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private errorHandler(err: HttpErrorResponse) {
    if (err.error instanceof ErrorEvent) {
      console.error(
        `[API]: Response @${err.url}\nCode: ${err.status}\nError-Origin: Client.\nError log:\n`,
        err.error.message
      );
      return throwError(
        '[RegistrationService] Failed-Registration-Exception: User registration request rejected.'
      );
    } else {
      console.error(
        `[API]: Response @${err.url}\nCode: ${err.status}\nError-Origin: Server.\nError log:\n`,
        err.error.message
      );
      return throwError(
        '[RegistrationService] Failed-Registration-Exception: Server encountered an error while processing request.'
      );
    }
  }

  sendCompanyRegistrationRequest(
    req: SendCompanyRegistrationRequest
  ): Observable<SendCompanyRegistrationResponse> {
    return this.http
      .post<SendCompanyRegistrationResponse>(
        `${this.root}/api/registration/company`,
        req,
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }

  sendWorkerRegistrationRequest(
    req: SendWorkerRegistrationRequest
  ): Observable<SendWorkerRegistrationResponse> {
    return this.http
      .post<SendWorkerRegistrationResponse>(
        `${this.root}/api/registration/worker`,
        req,
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }
}
