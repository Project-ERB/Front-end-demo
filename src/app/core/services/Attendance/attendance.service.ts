// attendance.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

export interface CheckInRequest {
  id: string;          // employee id
  companyId: string;
  latitudeUser: number;
  longitudeUser: number;
}

export enum CompanyId {
  ERPSystemsMansoura = '09029074-1646-40B0-AE84-682ABBE7246A',
  TechSolutionsCairo = '0BB37EBC-8D0D-41EB-9614-A1BDD960A886',
  TechSolutionsAlex = '3CE842B6-7BA5-4282-994C-D8AD4DC53D9C',
  DigitalHubGiza = '2FB02034-0104-4ACE-BED1-D8F766C91179',
  SmartSolutionsTanta = 'C4AB81D6-56B6-4BA0-A4A5-F7B4596F4A72',
  BooleignUSA = '755A8205-4EB2-43DA-9C0E-FA94D79D7048',
}

export const COMPANIES: { id: string; name: string; branch: string }[] = [
  { id: CompanyId.ERPSystemsMansoura, name: 'ERP Systems', branch: 'Mansoura Branch' },
  { id: CompanyId.TechSolutionsCairo, name: 'Tech Solutions', branch: 'Cairo HQ' },
  { id: CompanyId.TechSolutionsAlex, name: 'Tech Solutions', branch: 'Alex Branch' },
  { id: CompanyId.DigitalHubGiza, name: 'Digital Hub', branch: 'Giza Office' },
  { id: CompanyId.SmartSolutionsTanta, name: 'Smart Solutions', branch: 'Tanta Branch' },
  { id: CompanyId.BooleignUSA, name: 'Booleing', branch: 'USA Branch' },
];

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly _http = inject(HttpClient);
  private readonly _platform = inject(PLATFORM_ID);

  private getToken(): string | null {
    return isPlatformBrowser(this._platform)
      ? localStorage.getItem('accessToken')
      : null;
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    });
  }

  checkIn(payload: CheckInRequest): Observable<any> {
    return this._http.post(
      `${Environment.baseUrl}/api/attendance/checkin`,
      payload,
      { headers: this.headers }
    );
  }

  scan(nationalId: string): Observable<any> {
    return this._http.post(
      `${Environment.baseUrl}/api/attendance/scan?nationalId=${nationalId}`,
      {},
      { headers: this.headers }
    );
  }


  getAttendanceByNationalId(nationalId: string): Observable<any> {
    const query = `
    query {
      attendancesByNationalId(nationalId: "${nationalId}") {
        nodes {
          id
          workDate
          checkIn
          checkOut
          bookingHours
          lateMinutes
          overtimeMinutes
          attendanceStatus
          nationalId
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

  getAttendanceById(attendanceId: string): Observable<any> {
    const query = `
    query {
      attendance(attendanceId: "${attendanceId}") {
        id
        workDate
        checkIn
        checkOut
        bookingHours
        lateMinutes
        overtimeMinutes
        attendanceStatus
        nationalId
      }
    }
  `;

    return this._http.post(
      `${Environment.baseUrl}/graphql`,
      { query },
      { headers: this.headers }
    );
  }

  deleteAttendance(attendanceId: string): Observable<any> {
    return this._http.delete(
      `${Environment.baseUrl}/api/attendances/${attendanceId}`,
      { headers: this.headers }
    );
  }

  insertQrCode(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
      // مش بنحط Content-Type هنا عشان الـ browser يحطها تلقائي مع الـ boundary
    });

    return this._http.post(
      `${Environment.baseUrl}/api/attendance/InsertQrCode`,
      formData,
      { headers }
    );
  }

}