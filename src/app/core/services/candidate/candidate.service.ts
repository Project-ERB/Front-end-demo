import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';
import { map } from 'rxjs';

export interface CandidateApiNode {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  jobTitle: string;
  experienceInYears: number;
  expectedSalaryAmount: number;
  expectedSalaryCurrency: string;
  resumeUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private readonly _HttpClient = inject(HttpClient);

  addCandidate(data: any) {
    return this._HttpClient.post(`${Environment.baseUrl}/api/candidates/add`, data);
  }

  deleteCandidate(id: string) {
    return this._HttpClient.delete(`${Environment.baseUrl}/api/candidates/Delete`, {
      params: { id }
    });
  }

  getCandidates() {
    const query = `
      query {
        candidates {
          nodes {
            id
            experienceInYears
            fullName
            email
            phone
            city
            country
            jobTitle
            expectedSalaryAmount
            expectedSalaryCurrency
            resumeUrl
          }
        }
      }
    `;
    return this._HttpClient
      .post<{ data: { candidates: { nodes: CandidateApiNode[] } } }>(
        `${Environment.baseUrl}/graphql`, { query }
      )
      .pipe(map((res) => res.data.candidates.nodes));
  }

  // ← أضفنا getCandidateById
  getCandidateById(id: string) {
    const query = `
      query {
        candidate(id: "${id}") {
          id
          experienceInYears
          fullName
          email
          phone
          city
          country
          jobTitle
          expectedSalaryAmount
          expectedSalaryCurrency
          resumeUrl
        }
      }
    `;
    return this._HttpClient
      .post<{ data: { candidate: CandidateApiNode } }>(
        `${Environment.baseUrl}/graphql`, { query }
      )
      .pipe(map((res) => res.data.candidate));
  }
}