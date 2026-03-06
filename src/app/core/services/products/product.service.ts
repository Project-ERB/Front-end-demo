import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  // ✅ Get Categories (GraphQL)

  getProductById(id: string): Observable<any> {
    const token = this.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    const body = {
      query: `
      query {
        products {
          nodes {
            id
            code
            name
            shortDescription
            categoryId
            productType
            uomCode
            uomName
            costPrice
            sellingPrice
            currency
            taxRateValue
            taxRateName
            isTrackInventory
            baseBarcode
            notes
            imageUrl
            specifications {
              key
              value
              displayOrder
            }
            variants {
              sku
              barcode
              priceOverrideAmount
            }
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

  getProducts(): Observable<any> {

    const token = this.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    const body = {
      query: `
      query {
        products {
          nodes {
            id
            code
            name
            shortDescription
            categoryId
            productType
            uomCode
            uomName
            costPrice
            sellingPrice
            currency
            taxRateValue
            taxRateName
            isTrackInventory
            baseBarcode
            notes
            imageUrl
            specifications {
              key
              value
              displayOrder
            }
            variants {
              sku
              barcode
              priceOverrideAmount
            }
          }
        }
      }
    `,
    };

    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/graphql`,
      body,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      }
    );
  }

  addProduct(data: FormData) {
    const token = localStorage.getItem('accessToken');

    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : undefined;

    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/api/products/AddProduct`,
      data,
      { headers }
    );
  }


  ubdateProduct(id: string, data: object): Observable<any> {
    return this._HttpClient.put(`${Environment.baseUrl}/api/products/update/${id}`, data)
  }
}
