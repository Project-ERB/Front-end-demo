import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Environment } from '../../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export interface DepartmentNode {
  id: string;
  name: string;
  description: string;
  managerId: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);

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

  addDepartment(data: object): Observable<any> {
    return this._HttpClient.post(
      `${Environment.baseUrl}/api/departments/AddDepartment`,
      data,
      { headers: this.headers }
    );
  }

  updateDepartment(data: object): Observable<any> {
    return this._HttpClient.put(
      `${Environment.baseUrl}/api/departments/update`,
      data,
      { headers: this.headers }
    );
  }

  deleteDepartment(id: string): Observable<any> {
    return this._HttpClient.delete(
      `${Environment.baseUrl}/api/departments/${id}`,
      { headers: this.headers }
    );
  }

  getDepartments(): Observable<DepartmentNode[]> {
    const query = `
      query {
        departments {
          nodes {
            id
            name
            description
            managerId
            isActive
          }
        }
      }
    `;

    return this._HttpClient
      .post<{ data: { departments: { nodes: DepartmentNode[] } } }>(
        `${Environment.baseUrl}/graphql`,
        { query },
        { headers: this.headers }
      )
      .pipe(map(res => res.data.departments.nodes));
  }

  getDepartmentById(id: string): Observable<DepartmentNode> {
    const query = `
    query {
      department(id: "${id}") {
        id
        name
        description
        managerId
        isActive
      }
    }
  `;

    return this._HttpClient
      .post<{ data: { department: DepartmentNode } }>(
        `${Environment.baseUrl}/graphql`,
        { query },
        { headers: this.headers }
      )
      .pipe(map(res => res.data.department));
  }

}