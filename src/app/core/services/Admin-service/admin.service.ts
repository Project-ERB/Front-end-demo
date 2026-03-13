import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface RoleAllowAccess {
  allowCreate: boolean;
  allowDelete: boolean;
  allowUpdate: boolean;
  allowView: boolean;
}

export interface RolePermission {
  name: string;
  description: string;
  resources: string[];
  allowAccess: RoleAllowAccess[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  constructor(private _http: HttpClient) { }
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);

  private getToken(): string | null {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
    });
  }

  // ── Create user ──────────────────────────────────────────────────────────
  createAdminNewUser(data: object): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/Admin/NewUser`, data, { headers: this.headers });
  }

  // ── Create role ──────────────────────────────────────────────────────────
  creatCustomRole(data: object): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/roles`, data, { headers: this.headers });
  }

  // ── Update role ──────────────────────────────────────────────────────────
  updateRole(id: string, name: number): Observable<any> {
    return this._http.put(`${Environment.baseUrl}/roles`, { id, name }, { headers: this.headers });
  }

  // ── Delete role ──────────────────────────────────────────────────────────
  deleteRole(id: string): Observable<any> {
    return this._http.delete(`${Environment.baseUrl}/roles/${id}`, { headers: this.headers });
  }

  // ── Get all roles (GraphQL) ──────────────────────────────────────────────
  getRoles(): Observable<Role[]> {
    const query = `
      query {
        roles {
          nodes {
            id
            name
            description
            permissions {
              name
              description
              resources
              allowAccess {
                allowCreate
                allowDelete
                allowUpdate
                allowView
              }
            }
          }
        }
      }
    `;

    return this._http
      .post<{ data: { roles: { nodes: Role[] } } }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        { query },
        { headers: this.headers }
      )
      .pipe(map(res => res.data.roles.nodes));
  }
}