//auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private _http: HttpClient) {
    this.initAuth();
  }

  accessToken: WritableSignal<string> = signal('');

  initAuth() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.accessToken.set(token);
    }
  }

  saveAuthData(res: any) {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('role', res.roles[0]);
    this.accessToken.set(res.accessToken);
  }

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

  ForgotPassword(email: string): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/api/User/ForgotPassword/${email}`, {});
  }

  ResetPassword(data: object): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/api/User/ResetPassword`, data);
  }

  VerifyResetOtp(data: object): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/api/User/VerifyResetOtp`, data);
  }

  RegisterCustomer(data: object): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/api/Customer/register`, data);
  }

  // للـ OTP بعد الـ register
  VerifyCustomerEmail(data: { otp: number; email: string }): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/api/Auth/ConfirmEmail`, data);
  }
  // للـ token بييجي من الـ email link
  // للـ token بييجي من الـ email link
  ConfirmEmail(token: string, email: string): Observable<any> {
    // ✅ GET request مع Query Parameters
    return this._http.get(
      `${Environment.baseUrl}/api/Auth/confirmemail`,
      {
        params: {
          email: email,
          token: token
        }
      }
    );
  }

  ResendVerificationCode(email: string): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/api/Auth/SendOTP`, { email });
  }

  VerifyPassword(email: string, token: string, newPassword: string): Observable<any> {
    return this._http.post(
      `${Environment.baseUrl}/api/User/VerifyPassword`,
      { newPassword },  // Body
      {
        params: {
          email: email,
          token: token
        }
      }
    );
  }
}