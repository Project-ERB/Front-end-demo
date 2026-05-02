import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JopService {
  private readonly _HttpClient = inject(HttpClient);

  addrequirements(data: any) {
    return this._HttpClient.post(`${Environment.baseUrl}/api/recruitment/add`, data);
  }

  updateSalary(data: { recrumentId: string; minSalaryAmount: number; salaryCurrency: string; maxSalaryAmount: number }) {
    return this._HttpClient.put(`${Environment.baseUrl}/api/recruitments/update-salary`, data);
  }

  deleteRecruitment(id: string) {
    return this._HttpClient.delete(`${Environment.baseUrl}/api/recruitment/Delete`, {
      params: { id }
    });
  }

  getDepartments() {
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
      .post<any>(`${Environment.baseUrl}/graphql`, { query })
      .pipe(map((res) => res.data.departments.nodes as { id: string; name: string }[]));
  }

  getRecruitments() {
    const query = `
    query {
      recruitments {
        nodes {
          id
          title
          description
          minSalaryAmount
          minSalaryCurrency
          maxSalaryAmount
          maxSalaryCurrency
          experienceLevel
          departmentId
          employeeId
        }
      }
    }
  `;
    return this._HttpClient
      .post<any>(`${Environment.baseUrl}/graphql`, { query })
      .pipe(map((res) => res.data.recruitments.nodes));
  }

  getRecruitmentById(id: string) {
    const query = `
    query {
      recruitment(id: "${id}") {
        id
        title
        description
        minSalaryAmount
        minSalaryCurrency
        maxSalaryAmount
        maxSalaryCurrency
        experienceLevel
        departmentId
        employeeId
      }
    }
  `;
    return this._HttpClient
      .post<any>(`${Environment.baseUrl}/graphql`, { query })
      .pipe(map((res) => res.data.recruitment));
  }
}