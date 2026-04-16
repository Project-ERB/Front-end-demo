import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

// ── Interfaces ───────────────────────────────────────────────────────────────
export interface RoleAllowAccess {
  allowCreate: boolean;
  allowDelete: boolean;
  allowUpdated: boolean;
  allowView: boolean;
}

export interface SystemHealth {
  status: string;
  cpuLoadPercentage: number;
  memoryUsageGb: number;
  totalMemoryGb: number;
  networkLatencyMs: number;
}

export interface RolePermission {
  id: string;
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

export interface UpdateRolePermission {
  permissionId: string;
  permissionName?: string;
  allowCreate: boolean;
  allowDelete: boolean;
  allowUpdated: boolean;
  allowView: boolean;
}

export interface UpdateRoleBody {
  name: number;
  description: string;
  setPermissions: UpdateRolePermission[];
}

// ── Permission node returned by GraphQL ──────────────────────────────────────
export interface PermissionNode {
  id: string;
  name: string;
  description: string;
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
      Authorization: `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  // ── Create user ──────────────────────────────────────────────────────────
  createAdminNewUser(data: object): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/Admin/NewUser`, data, {
      headers: this.headers,
    });
  }

  // ── Create role ──────────────────────────────────────────────────────────
  creatCustomRole(data: object): Observable<any> {
    return this._http.post(`${Environment.baseUrl}/roles`, data, {
      headers: this.headers,
    });
  }

  // ── Update role ──────────────────────────────────────────────────────────
  updateRole(id: string, body: UpdateRoleBody): Observable<any> {
    return this._http.put(`${Environment.baseUrl}/roles/${id}`, body, {
      headers: this.headers,
    });
  }

  // ── Delete role ──────────────────────────────────────────────────────────
  deleteRole(id: string): Observable<any> {
    return this._http.delete(`${Environment.baseUrl}/roles/${id}`, {
      headers: this.headers,
    });
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
      .pipe(map((res) => res.data.roles.nodes));
  }

  // ── Get all permissions (GraphQL) ────────────────────────────────────────
  getPermissions(): Observable<PermissionNode[]> {
    const query = `
      query {
        permissions {
          nodes {
            id 
            name
            description
          }
        }
      }
    `;
    return this._http
      .post<{ data: { permissions: { nodes: PermissionNode[] } } }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        { query },
        { headers: this.headers }
      )
      .pipe(
        map((res) => {
          console.log('Permissions nodes:', res.data.permissions.nodes);
          return res.data.permissions.nodes;
        })
      );
  }

  // ── Get role by id (GraphQL) ─────────────────────────────────────────────
  getRoleById(id: string): Observable<Role> {
    const query = `
      query GetRole($id: UUID!) {
        role(id: $id) {
          id
          name
          description
        }
      }
    `;
    return this._http
      .post<{ data: { role: Role } }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        { query, variables: { id } },
        { headers: this.headers }
      )
      .pipe(map((res) => res.data.role));
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this._http.get<SystemHealth>(
      `${Environment.baseUrl}/Admin/healthy`,
      { headers: this.headers }
    );
  }
}