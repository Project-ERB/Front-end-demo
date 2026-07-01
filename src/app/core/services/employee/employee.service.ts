import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

// ── Interfaces ──────────────────────────────────────────────────────────────
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface EmployeesConnection {
  nodes: EmployeeNode[];
  pageInfo: PageInfo;
}

export interface EmployeeNode {
  id: string;
  name: string;
  phoneNumber: string;
  salary: number;
  currency: string;
  employeeLevel: string;
  departmentId: string;
  employeeType: string;
  status: string;
  managerId: string;
  nationalID?: string;
  hiredate?: string;
  roleId?: string;
  email?: string;
  qrCodePath?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const EMPTY_CONNECTION: EmployeesConnection = {
  nodes: [],
  pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
};

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);

  // ── Auth Header ───────────────────────────────────────────────────────────
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

  // ── Create Employee (REST) ────────────────────────────────────────────────
  createEmployee(data: object): Observable<any> {
    return this._HttpClient.post(
      `${Environment.baseUrl}/api/employees/Register`,
      data,
      { headers: this.headers }
    );
  }

  updateEmployee(data: object): Observable<any> {
    return this._HttpClient.put(
      `${Environment.baseUrl}/api/employees/update`,
      data,
      { headers: this.headers }
    );
  }

  deleteEmployee(id: string): Observable<any> {
    return this._HttpClient.delete(
      `${Environment.baseUrl}/api/employees/${id}`,
      { headers: this.headers }
    );
  }

  // ── Get All Employees (GraphQL) — Cursor-Based Pagination ─────────────────
  getEmployees(
    first?: number,
    after?: string | null,
    last?: number,
    before?: string | null
  ): Observable<EmployeesConnection> {
    const args: string[] = [];
    if (first != null) args.push(`first: ${first}`);
    if (after) args.push(`after: "${after}"`);
    if (last != null) args.push(`last: ${last}`);
    if (before) args.push(`before: "${before}"`);
    const argsStr = args.length ? `(${args.join(', ')})` : '';

    const query = `
      query {
        employees${argsStr} {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          nodes {
            id
            hiredate
            employeeType
            status
            roleId
            managerId
            name
            nationalID
            phoneNumber
            address {
              street
              city
              state
              postalCode
              country
            }
            email
            salary
            currency
            employeeLevel
            departmentId
            qrCodePath
          }
        }
      }
    `;

    return this._HttpClient
      .post<{ data: { employees: EmployeesConnection | null } | null; errors?: any[] }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        { query },
        { headers: this.headers }
      )
      .pipe(map(res => {
        if (res?.errors?.length) {
          console.error('GraphQL errors (getEmployees):', res.errors);
        }
        // ✅ Defensive fallback: never let consumers receive/crash on null
        // (can happen if an invalid/stale cursor is sent, auth fails, or
        // the resolver throws and GraphQL still returns HTTP 200 with data:null)
        const connection = res?.data?.employees;
        if (!connection) {
          console.warn('getEmployees: backend returned null employees connection. Falling back to empty list.', res);
          return EMPTY_CONNECTION;
        }
        return connection;
      }));
  }

  // ── Get Employee By ID ────────────────────────────────────────────────────
  getEmployeeById(nationalId: string): Observable<EmployeeNode> {
    const query = `
      query {
        employee(nationalId: "${nationalId}") {
          id
          hiredate
          employeeType
          status
          roleId
          managerId
          name
          nationalID
          phoneNumber
          address {
            street
            city
            state
            postalCode
            country
          }
          email
          salary
          currency
          employeeLevel
          departmentId
        }
      }
    `;

    return this._HttpClient
      .post<{ data: { employee: EmployeeNode } }>(
        `${Environment.baseUrl}/graphql`,
        { query },
        { headers: this.headers }
      )
      .pipe(map(res => res.data.employee));
  }

  // ── Get Departments ───────────────────────────────────────────────────────
  getDepartments(): Observable<{ id: string; name: string }[]> {
    const query = `
      query {
        departments {
          nodes {
            id
            name
          }
        }
      }
    `;

    return this._HttpClient
      .post<{ data: { departments: { nodes: { id: string; name: string }[] } | null } | null }>(
        `${Environment.baseUrl}/graphql`,
        { query },
        { headers: this.headers }
      )
      .pipe(map(res => res?.data?.departments?.nodes ?? []));
  }
}