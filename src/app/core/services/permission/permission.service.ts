import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

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

// ── SystemLog interface هنا هي المصدر الوحيد ──────────────────────────────
export type LogStatus = 'Success' | 'Critical' | 'Warning' | 'Info';

export interface SystemLog {
  id: string;
  timestamp: string;
  userInitials: string;
  userBg: string;
  userText: string;
  userName: string;
  ip: string;
  module: string;
  action: string;
  actionHighlight?: string;
  status: LogStatus;
  selected: boolean;
  oldValues?: string | null;
  newValues?: string | null;
  userId?: string | null;
  correlationId?: string;
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
  userName: string | null;
  userRole: string | null;
}

export interface AllowAccess {
  allowCreate: boolean;
  allowDelete: boolean;
  allowUpdate: boolean;
  allowView: boolean;
}

export interface PermissionNode {
  id: string;
  name: PermissionName;
  resources: string[];
  description: string;
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

export enum PermissionName {
  FullAccess = 'FullAccess',
  ViewSales = 'ViewSales',
  ManageSales = 'ManageSales',
  ProcessRefunds = 'ProcessRefunds',
  ManagePromotions = 'ManagePromotions',
  ViewWarehouses = 'ViewWarehouses',
  ManageWarehouses = 'ManageWarehouses',
  ViewProducts = 'ViewProducts',
  ManageProducts = 'ManageProducts',
  ManageSuppliers = 'ManageSuppliers',
  ViewHR = 'ViewHR',
  ManageHR = 'ManageHR',
  ManagePayroll = 'ManagePayroll',
  ViewFinanceReports = 'ViewFinanceReports',
  ManageInvoices = 'ManageInvoices',
  ManagePayments = 'ManagePayments',
  ViewCustomers = 'ViewCustomers',
  ManageCustomers = 'ManageCustomers',
  ManageUsersAndRoles = 'ManageUsersAndRoles',
  ManageSystemSettings = 'ManageSystemSettings',
}

export const PERMISSION_GROUPS: { label: string; values: PermissionName[] }[] = [
  { label: 'Global Permissions', values: [PermissionName.FullAccess] },
  {
    label: 'E-Commerce & Sales',
    values: [PermissionName.ViewSales, PermissionName.ManageSales, PermissionName.ProcessRefunds, PermissionName.ManagePromotions],
  },
  {
    label: 'Inventory & Products',
    values: [PermissionName.ViewWarehouses, PermissionName.ManageWarehouses, PermissionName.ViewProducts, PermissionName.ManageProducts, PermissionName.ManageSuppliers],
  },
  { label: 'HR', values: [PermissionName.ViewHR, PermissionName.ManageHR, PermissionName.ManagePayroll] },
  {
    label: 'Finance & Accounting',
    values: [PermissionName.ViewFinanceReports, PermissionName.ManageInvoices, PermissionName.ManagePayments],
  },
  { label: 'Customers', values: [PermissionName.ViewCustomers, PermissionName.ManageCustomers] },
  { label: 'System Administration', values: [PermissionName.ManageUsersAndRoles, PermissionName.ManageSystemSettings] },
];

@Injectable({ providedIn: 'root' })
export class PermissionService {

  private _log: SystemLog | null = null;
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);

  set(log: SystemLog): void { this._log = log; }
  get(): SystemLog | null { return this._log; }
  clear(): void { this._log = null; }

  constructor(private http: HttpClient) { }

  // ── Auth header helper ───────────────────────────────────────────────────
  private getToken(): string | null {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`,
    });
  }

  // ── Logs ─────────────────────────────────────────────────────────────────
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
            userName
            userRole
            ipAddress
          }
        }
      }
    `;
    return this.http
      .post<{ data: { logs: { nodes: LogNode[] } } }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        { query },
        { headers: this.headers }   // ← Authorization مضاف
      )
      .pipe(map(res => res.data.logs.nodes));
  }

  // ── Permissions ──────────────────────────────────────────────────────────
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
    return this.http
      .post<{ data: { permissions: { nodes: PermissionNode[] } } }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        { query },
        { headers: this.headers }   // ← Authorization مضاف
      )
      .pipe(map(res => res.data.permissions.nodes));
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
  createPermission(payload: CreatePermissionRequest): Observable<CreatePermissionResponse> {
    return this.http.post<CreatePermissionResponse>(
      `${Environment.baseUrl}/api/permissions`, payload,
      { headers: this.headers }
    );
  }

  updatePermission(payload: UpdatePermissionRequest): Observable<CreatePermissionResponse> {
    return this.http.put<CreatePermissionResponse>(
      `${Environment.baseUrl}/api/permissions`, payload,
      { headers: this.headers }
    );
  }

  deletePermission(id: string): Observable<CreatePermissionResponse> {
    return this.http.delete<CreatePermissionResponse>(
      `${Environment.baseUrl}/api/permissions/${id}`,
      { headers: this.headers }
    );
  }
}