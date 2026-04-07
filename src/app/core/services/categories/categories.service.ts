import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';
import { Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly _httpClient = inject(HttpClient);

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private getHeaders(includeContentType = false): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  // ✅ Get Parent Categories (GraphQL)
  getCategories(): Observable<any[]> {
    const body = {
      query: `
        query {
          parentCategories {
            nodes {
              id
              name
              code
              parentCategoryId
            }
          }
        }
      `,
    };
    return this._httpClient
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders(true) })
      .pipe(map(res => res?.data?.parentCategories?.nodes ?? []));
  }

  // ✅ Get Category Details by ID (GraphQL)
  // ✅ Get Category Details by ID (GraphQL)
  getCategoryById(id: string): Observable<any> {
    const body = {
      query: `
      query {
        category(id: "${id}") {
          id
          code
          name
          description
          isActive
        }
      }
    `,
    };
    return this._httpClient
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders(true) })
      .pipe(map(res => res?.data?.category ?? null));
  }

  // ✅ Get Child Categories by parentId (GraphQL)
  getChildCategories(parentId: string): Observable<any[]> {
    const body = {
      query: `
        query {
          childCategories(parentId: "${parentId}") {
            nodes {
              id
              code
              name
              description
              parentCategoryId
              isActive
            }
          }
        }
      `,
    };
    return this._httpClient
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders(true) })
      .pipe(map(res => res?.data?.childCategories?.nodes ?? []));
  }

  // ✅ Get Products by categoryId (GraphQL)
  getProductsByCategory(categoryId: string): Observable<any[]> {
    const body = {
      query: `
        query {
          products(where: {
            categoryId: {
              eq: "${categoryId}"
            }
          }) {
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
    return this._httpClient
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders(true) })
      .pipe(map(res => res?.data?.products?.nodes ?? []));
  }

  // ✅ Add Category (REST)
  addCategory(body: any): Observable<any> {
    return this._httpClient.post(
      `${Environment.baseUrl}/api/categories`,
      body,
      { headers: this.getHeaders(true) }
    );
  }

  // ✅ Update Category (REST)
  updataecategore(data: any, id: string): Observable<any> {
    return this._httpClient.put(
      `${Environment.baseUrl}/api/categories/${id}`,
      data,
      { headers: this.getHeaders(true) }
    );
  }

  // ✅ Delete single category (REST)
  deleteCategory(categoryId: string): Observable<any> {
    return this._httpClient.delete(
      `${Environment.baseUrl}/api/categories/${categoryId}`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ Delete ALL categories
  deleteAllCategories(ids: string[]): Observable<any> {
    let params = new HttpParams();
    ids.forEach(id => (params = params.append('ids', id)));
    return this._httpClient.delete(
      `${Environment.baseUrl}/api/categories/bulk`,
      { headers: this.getHeaders(), params }
    );
  }

  getCategoriesWithChildren(): Observable<any[]> {
    const body = {
      query: `
      query {
        parentCategories {
          nodes {
            id
            name
            code
            childCategories {
              nodes {
                id
                name
                code
                parentCategoryId
              }
            }
          }
        }
      }
    `,
    };
    return this._httpClient
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders(true) })
      .pipe(map(res => res?.data?.parentCategories?.nodes ?? []));
  }
}