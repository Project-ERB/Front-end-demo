import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetproductService {

  private readonly _httpClient = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getproducts(): Observable<any> {

    const token = this.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    const body = {
      query: `
        query getAllProducts {
          products(first: 50) {
            nodes {
              id
              name
            }
          }
        }
      `
    };

    return this._httpClient.post<any>(
      `${Environment.baseUrl}/graphql`,
      body,
      { headers }
    );
  }
}