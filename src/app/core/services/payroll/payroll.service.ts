import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

export interface AddPayrollRequest {
  periodStart: string;
  periodEnd: string;
  bonusAmount: number;
  employeeId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private readonly _http = inject(HttpClient);
  private readonly _platformId = inject(PLATFORM_ID);

  private getToken(): string | null {
    if (isPlatformBrowser(this._platformId)) {
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

  addPayroll(payload: AddPayrollRequest): Observable<any> {
    return this._http.post(
      `${Environment.baseUrl}/api/payroll/add`,
      payload,
      { headers: this.headers }
    );
  }

  updatePayroll(payrollId: string, bonus: number): Observable<any> {
    return this._http.put(
      `${Environment.baseUrl}/api/payroll/update?payrollId=${payrollId}&Bounus=${bonus}`,
      {},
      { headers: this.headers }
    );
  }

  deletePayroll(payrollId: string): Observable<any> {
    return this._http.delete(
      `${Environment.baseUrl}/api/payrolls/${payrollId}`,
      { headers: this.headers }
    );
  }


  getPayrollsByEmployeeId(employeeId: string): Observable<any> {
    const query = `
    query {
      payrollsByEmployeeId(employeeId: "${employeeId}") {
        nodes {
          id
          periodStart
          periodEnd
          basicSalary
          bonus
          netSalary
          paymentDate
          employeeId
        }
      }
    }
  `;

    return this._http.post(
      `${Environment.baseUrl}/graphql`,
      { query },
      { headers: this.headers }
    );
  }


  getPayrollById(id: string): Observable<any> {
    const query = `
    query {
      payroll(id: "${id}") {
        id
        periodStart
        periodEnd
        basicSalary
        bonus
        netSalary
        paymentDate
        employeeId
      }
    }
  `;
    return this._http.post(
      `${Environment.baseUrl}/graphql`,
      { query },
      { headers: this.headers }
    );
  }
}