import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root',
})
export class AdminService {

  constructor(private _http: HttpClient) { }
  private readonly _PLATFORM_ID = inject(PLATFORM_ID)

  private getToken(): string | null {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }


  // ← من localStorage مباشرة
  private headers = new HttpHeaders({
    'Authorization': `Bearer ${this.getToken()}`,
    'Content-Type': 'application/json'
  });

  createAdminNewUser(data: object): Observable<any> {

    return this._http.post(`${Environment.baseUrl}/Admin/NewUser`, data, { headers: this.headers });
  }

  creatCustomRole(data: object): Observable<any> {

    return this._http.post(`${Environment.baseUrl}/roles`, data, { headers: this.headers });
  }

}
