import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface AddToCartPayload {
  sku: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class ECommerceService {

  private readonly _HttpClient = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  addToCart(payload: AddToCartPayload): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/api/carts`,
      payload,
      { headers }
    );
  }

}
