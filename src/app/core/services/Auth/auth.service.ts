import { HttpClient, HttpHeaders } from '@angular/common/http';  // ← أضف HttpHeaders
import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private _http: HttpClient) { }

  accessToken: WritableSignal<string> = signal('');

  AdminLogin(data: object): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/api/Auth/Login`, data);
  }

  AdminrefreshToken(): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/api/Auth/RefreshToken`, {
      refreshToken: localStorage.getItem('refreshToken')!
    });
  }

  RegisterEmployee(data: object): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/api/Auth/Register-Employee`, data);
  }

}