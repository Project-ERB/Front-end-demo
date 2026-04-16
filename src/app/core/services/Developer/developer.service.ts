import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';

const GET_ENDPOINTS = gql`
  query {
    endpoints {
      nodes {
        path
        method
        isActive
        __typename
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeveloperService {
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly apollo = inject(Apollo);

  private authorizedEndpointsQuery: any;

  getAuthorizedEndpoints() {
    this.authorizedEndpointsQuery = this.apollo.watchQuery({
      query: gql`
      query {
        authorizedEndpoints {
          nodes {
            id
            path
            method
            isActive
            __typename
          }
        }
      }
    `,
      fetchPolicy: 'network-only'
    });
    return this.authorizedEndpointsQuery.valueChanges;
  }

  // ✅ دالة جديدة للـ refetch
  refetchAuthorizedEndpoints() {
    return this.authorizedEndpointsQuery?.refetch();
  }


  getEndpoints(): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: GET_ENDPOINTS
    }).valueChanges;
  }

  private getToken(): string | null {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      return localStorage.getItem('accessToken');
    }
    return null;

  }


  private get headers(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      console.error('No access token found!');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
    });
  }


  createEndpoint(data: any) {

    return this.http.post(`${Environment.baseUrl}/api/Authorization`,
      data
    );
  }

}
