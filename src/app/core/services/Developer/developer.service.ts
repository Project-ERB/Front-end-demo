import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';

const GET_ENDPOINTS = gql`
  query GetEndpoints($first: Int, $after: String) {
    endpoints(first: $first, after: $after) {
      nodes {
        path
        method
        isActive
        __typename
      }
      pageInfo{
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        __typename
      }
      totalCount
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

  getAuthorizedEndpoints(first: number = 10, after?: string) {
    this.authorizedEndpointsQuery = this.apollo.watchQuery({
      query: gql`
      query GetAuthorizedEndpoints($first: Int, $after: String) {
        authorizedEndpoints(first: $first, after: $after) {
          nodes {
            id
            path
            method
            isActive
            roles        # ✅
            permissions  # ✅
            __typename
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    `,
      variables: { first, after },
      fetchPolicy: 'network-only'
    });
    return this.authorizedEndpointsQuery.valueChanges;
  }

  getEndpointById(id: string): Observable<any> {
    return this.apollo.query<any>({
      query: gql`
      query GetEndpointById($id: UUID!) {
        endpoint(id: $id) {
          id
          path
          method
          isActive
          roles
          permissions
        }
      }
    `,
      variables: { id },
      fetchPolicy: 'network-only'
    });
  }

  // ✅ refetch بعد أي تعديل
  refetchAuthorizedEndpoints() {
    return this.authorizedEndpointsQuery?.refetch();
  }

  getEndpoints(first: number = 10, after?: string): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: GET_ENDPOINTS,
      variables: { first, after }
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
    return this.http.post(`${Environment.baseUrl}/api/Authorization`, data);
  }

  deleteEndpoint(id: string) {
    return this.http.delete(`${Environment.baseUrl}/api/Authorization/${id}`);
  }

  // ✅ isActive بيتبعت كـ query parameter زي ما الـ Swagger بيقول
  updateEndpoint(id: string, isActive: boolean) {
    return this.http.put(
      `${Environment.baseUrl}/api/Authorization/DeActive/${id}?isActive=${isActive}`,
      {}
    );
  }

  updateRolesPermissions(id: string, roles: string[], permissions: string[]) {
    return this.http.put(
      `${Environment.baseUrl}/api/Authorization/updateRolesPermissions/${id}`,
      { roles, permissions }
    );
  }
}