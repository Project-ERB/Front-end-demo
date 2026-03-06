import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  // ✅ Get Categories (GraphQL)
  getCategories(): Observable<any[]> {
    const token = this.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    const body = {
      query: `
      query {
        categories(first: 100) {
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
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers })
      .pipe(
        map(res => res?.data?.categories?.nodes ?? [])
      );
  }

  // ✅ View Category Details (REST)
  viewCateDetails(id: string): Observable<any> {
    const token = this.getToken();

    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    return this._httpClient.get(
      `${Environment.baseUrl}/api/categories/${id}`,
      { headers }
    );
  }

  // ✅ Add Category (REST)
  addCategory(body: any): Observable<any> {
    const token = this.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    return this._httpClient.post(
      `${Environment.baseUrl}/api/categories`,
      body,
      { headers }
    );
  }

  updataecategore(data: any, id: string): Observable<any> {

    const token = this.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    return this._httpClient.put(`${Environment.baseUrl}/api/categories/${id}`, data)
  }

  deleteCategory(categoryId: string): Observable<any> {
    const token = this.getToken();

    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    return this._httpClient.delete(
      `${Environment.baseUrl}/api/categories/${categoryId}`,
      { headers }
    );
  }

}