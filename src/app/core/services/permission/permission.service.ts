import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';

export enum Resource {
  Sales = 0,
  SalesDashboard = 1,
  Products = 2,
  Categories = 3,
  Discounts = 4,
  Orders = 5,
  Customers = 6,
  HR = 7,
  Employees = 8,
  Departments = 9,
  Recruits = 10,
  Candidates = 11,
  Applications = 12,
  Inventory = 13,
  Admination = 14,
}

export interface LogNode {
  id: string;
  userAgent: string | null;
  correlationId: string;
  level: string;
  createdAt: string;
  tableName: string;
  action: string;
  primaryKey: string;
  oldValues: string | null;
  newValues: string | null;
  userId: string | null;
  ipAddress: string;
}

export interface AllowAccess {
  allowCreate: boolean;
  allowDelete: boolean;
  allowUpdate: boolean;
  allowView: boolean;
}

export interface PermissionNode {
  id: string;
  name: string;
  resources: string[];
  allowAccess: AllowAccess[];
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  resources: number[];
  allowAccess: AllowAccess;
}

export interface UpdatePermissionRequest {
  id: string;
  name: string;
  description: string;
  resources: number[];
}


export interface CreatePermissionResponse {
  [key: string]: any;
}
@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  constructor(private http: HttpClient) { }

  getLogs(): Observable<LogNode[]> {
    const query = `
      query {
        logs {
          nodes {
            id
            userAgent
            correlationId
            level
            createdAt
            tableName
            action
            primaryKey
            oldValues
            newValues
            userId
            ipAddress
          }
        }
      }
    `;

    const headers = { 'Content-Type': 'application/json' };

    return this.http
      .post<{ data: { logs: { nodes: LogNode[] } } }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        { query },
        { headers }
      )
      .pipe(map(res => res.data.logs.nodes));
  }

  getPermissions(): Observable<PermissionNode[]> {
    const query = `
      query {
        permissions {
          nodes {
            id
            name
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
    `;

    const body = { query };
    const headers = { 'Content-Type': 'application/json' };

    return this.http
      .post<{ data: { permissions: { nodes: PermissionNode[] } } }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        body,
        { headers }
      )
      .pipe(map(res => res.data.permissions.nodes));
  }

  createPermission(payload: CreatePermissionRequest): Observable<CreatePermissionResponse> {
    return this.http.post<CreatePermissionResponse>(`${Environment.baseUrl}/permissions`, payload);
  }

  updatePermission(payload: UpdatePermissionRequest): Observable<CreatePermissionResponse> {
    return this.http.put<CreatePermissionResponse>(
      `${Environment.baseUrl}/permissions`,
      payload
    );
  }

  deletePermission(id: string): Observable<CreatePermissionResponse> {
    return this.http.delete<CreatePermissionResponse>(
      `${Environment.baseUrl}/permissions/${id}`
    );
  }
}
