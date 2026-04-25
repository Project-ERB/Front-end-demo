import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Environment } from '../../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

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
  nationalID?: string;   // ← was a nested object, now just a string
  hiredate?: string;
  roleId?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}


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

  // ── Get All Employees (GraphQL) ───────────────────────────────────────────
  getEmployees(): Observable<EmployeeNode[]> {
    const query = `
        query {
      employees {
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
        }
      }
    }
  `;

    return this._HttpClient
      .post<{ data: { employees: { nodes: EmployeeNode[] } } }>(
        `${Environment.baseUrl}/graphql?t=${Date.now()}`,
        { query },
        { headers: this.headers }
      )
      .pipe(map(res => res.data.employees.nodes));
  }

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
      .post<{ data: { departments: { nodes: { id: string; name: string }[] } } }>(
        `${Environment.baseUrl}/graphql`,
        { query },
        { headers: this.headers }
      )
      .pipe(map(res => res.data.departments.nodes));
  }

}
