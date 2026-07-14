import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';

const GET_ENDPOINTS = gql`
  query {
    endpoints {
      path
      method
      isActive
      __typename
    }
  }
`;

const GET_AUTHORIZED_ENDPOINTS = gql`
  query {
    authorizedEndpoints {
      id
      path
      method
      isActive
      roles
      permissions
      __typename
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
    return this.apollo.query({
      query: GET_AUTHORIZED_ENDPOINTS,
      fetchPolicy: 'network-only'
    });
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