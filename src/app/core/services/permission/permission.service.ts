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
  userName: string | null;   // ✅ زود دي
  userRole: string | null;   // ✅ زود دي
}
export interface AllowAccess {
  allowCreate: boolean;
  allowDelete: boolean;
  allowUpdate: boolean;
  allowView: boolean;
}

export interface PermissionNode {
  id: string;
  name: PermissionName; // ← هنا نوعه PermissionName
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
  // Global
  FullAccess = 'FullAccess',
  // E-Commerce & Sales
  ViewSales = 'ViewSales',
  ManageSales = 'ManageSales',
  ProcessRefunds = 'ProcessRefunds',
  ManagePromotions = 'ManagePromotions',
  // Inventory & Products
  ViewWarehouses = 'ViewWarehouses',
  ManageWarehouses = 'ManageWarehouses',
  ViewProducts = 'ViewProducts',
  ManageProducts = 'ManageProducts',
  ManageSuppliers = 'ManageSuppliers',
  // HR
  ViewHR = 'ViewHR',
  ManageHR = 'ManageHR',
  ManagePayroll = 'ManagePayroll',
  // Finance & Accounting
  ViewFinanceReports = 'ViewFinanceReports',
  ManageInvoices = 'ManageInvoices',
  ManagePayments = 'ManagePayments',
  // Customers
  ViewCustomers = 'ViewCustomers',
  ManageCustomers = 'ManageCustomers',
  // System Administration
  ManageUsersAndRoles = 'ManageUsersAndRoles',
  ManageSystemSettings = 'ManageSystemSettings',
}

export const PERMISSION_GROUPS: { label: string; values: PermissionName[] }[] = [
  {
    label: 'Global Permissions',
    values: [PermissionName.FullAccess],
  },
  {
    label: 'E-Commerce & Sales',
    values: [
      PermissionName.ViewSales,
      PermissionName.ManageSales,
      PermissionName.ProcessRefunds,
      PermissionName.ManagePromotions,
    ],
  },
  {
    label: 'Inventory & Products',
    values: [
      PermissionName.ViewWarehouses,
      PermissionName.ManageWarehouses,
      PermissionName.ViewProducts,
      PermissionName.ManageProducts,
      PermissionName.ManageSuppliers,
    ],
  },
  {
    label: 'HR',
    values: [
      PermissionName.ViewHR,
      PermissionName.ManageHR,
      PermissionName.ManagePayroll,
    ],
  },
  {
    label: 'Finance & Accounting',
    values: [
      PermissionName.ViewFinanceReports,
      PermissionName.ManageInvoices,
      PermissionName.ManagePayments,
    ],
  },
  {
    label: 'Customers',
    values: [
      PermissionName.ViewCustomers,
      PermissionName.ManageCustomers,
    ],
  },
  {
    label: 'System Administration',
    values: [
      PermissionName.ManageUsersAndRoles,
      PermissionName.ManageSystemSettings,
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class PermissionService {

  private _log: SystemLog | null = null;

  set(log: SystemLog): void { this._log = log; }
  get(): SystemLog | null { return this._log; }
  clear(): void { this._log = null; }

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
        { headers: { 'Content-Type': 'application/json' } }
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
          description
        }
      }
    }
    `;
    return this.http
      .post<{ data: { permissions: { nodes: PermissionNode[] } } }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        { query },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .pipe(map(res => res.data.permissions.nodes));
  }

  createPermission(payload: CreatePermissionRequest): Observable<CreatePermissionResponse> {
    return this.http.post<CreatePermissionResponse>(
      `${Environment.baseUrl}/permissions`, payload
    );
  }

  updatePermission(payload: UpdatePermissionRequest): Observable<CreatePermissionResponse> {
    return this.http.put<CreatePermissionResponse>(
      `${Environment.baseUrl}/permissions`, payload
    );
  }

  deletePermission(id: string): Observable<CreatePermissionResponse> {
    return this.http.delete<CreatePermissionResponse>(
      `${Environment.baseUrl}/permissions/${id}`
    );
  }
}