import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';
import { Observable } from 'rxjs';
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
      products(where: { id: { eq: "${id}" } }) {
        nodes {
          id
          code
          name
          shortDescription
          fullDescription
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
          specifications { key value displayOrder }
          variants { sku barcode priceOverrideAmount }
        }
      }
    }`
    };
    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/graphql`,
      body,
      { headers }
    );
  }

  // getCategories(): Observable<any> {
  //   const token = this.getToken();
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Accept: 'application/json',
  //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //   });
  //   const body = {
  //     query: `
  //   query {
  //     parentCategories {
  //       nodes {
  //         id
  //         code
  //         name
  //         description
  //       }
  //     }
  //   }`
  //   };
  //   return this._HttpClient.post<any>(`${Environment.baseUrl}/graphql`, body, { headers });
  // }

  // ✅ Cache-busting timestamp added to force fresh data every call
  getProducts(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
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
    // ✅ ?t= timestamp busts any HTTP or CDN cache
    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/graphql?t=${Date.now()}`,
      body,
      { headers }
    );
  }

  addProduct(data: FormData) {
    const token = this.getToken();
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
    const token = this.getToken();
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
    return this._HttpClient.put(`${Environment.baseUrl}/api/products/update/${id}`, data, { headers });
  }

  // ✅ Delete a single product by ID
  deleteProduct(id: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
    return this._HttpClient.delete(`${Environment.baseUrl}/api/products/${id}`, { headers });
  }

  // ✅ Delete ALL products
  deleteAllProducts(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
    return this._HttpClient.delete(`${Environment.baseUrl}/api/products`, { headers });
  }
}