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

  // ✅ Centralized token retrieval (SSR-safe)
  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  // ✅ Centralized headers builder
  private getHeaders(includeContentType = false): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  // ✅ FIXED: استخدم parentCategories بدل categories
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

  // ✅ View Category Details (REST)
  viewCateDetails(id: string): Observable<any> {
    return this._httpClient.get(
      `${Environment.baseUrl}/api/categories/${id}`,
      { headers: this.getHeaders() }
    );
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
}