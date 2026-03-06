import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env'; // عدل المسار لو مختلف

@Injectable({
  providedIn: 'root',
})
export class ApollocatoriesService {
  constructor(private _httpClient: HttpClient) { }

  getCategoryById(id: string): Observable<any> {
    const body = {
      query: `
      query {
        category(id: "${id}") {
          id
          name
          code
        }
      }
    `
    };

    return this._httpClient.post<any>(
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

  getApollocategories(): Observable<any> {

    const body = {
      query: `
        query getAllCategories {
          parentCategories {
            nodes {
              id
              code
              name
              description
              parentCategoryId
            }
          }
        }
      `,
    };

    return this._httpClient.post<any>(
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
}