import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {

  private readonly _HttpClient = inject(HttpClient);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);

  GetToken(): string | null {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      return localStorage.getItem('accessToken')
    }
    return null
  }

  GetOrderDash() {

    const token = this.GetToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    const body = {
      query: `
      query {
      orders {
        nodes {
          totalDiscount
            totalTax
            grandTotal
              orderType
              orderNumber
                dueDate
                  orderDate
                  customerId
                    status 
        }
      }
    }
      `
    };

    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/graphql`,
      body,
      { headers }
    );

  }

}
