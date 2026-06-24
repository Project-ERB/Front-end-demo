import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';
import { map } from 'rxjs';

export interface CreateProcessPayload {
  candidateId: string;
  recrutmentId: string;
  currentStage: number;
  appStatus: number;
  startDate: string;
}

export interface CreateInterviewPayload {
  applicationProccessId: string;
  interviewer: string;
  location: string;
  interviewDate: string;
  interviewType: number;
  stageName: number;
}

export interface UpdateInterviewPayload {
  interviewId: string;
  interviewer: string;
  location: string;
  interviewDate: string;
}

export interface CreateOfferPayload {
  interviewId: string;
  salary: number;
  currency: string;
  expireDate: string;
  of: number;        // من الـ Swagger - شايف "of": 0
  isActive: boolean;
}

export interface ApplicationOffer {
  id: string;
  interviewId: string;
  salaryAmount: number;
  currencyCode: string;
  expireDate: string;
  offerStatus: number | string;
  isAvailable: boolean;
}

export interface ApplicationContract {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  typee: string;
  salaryAmount: number;
  salaryCurrency: string;
  status: string;
}

export interface ContractsGraphQLResponse {
  data: {
    contracts: {
      nodes: ApplicationContract[];
    };
  };
}

export interface OffersGraphQLResponse {
  data: {
    applicationOffers: {
      nodes: ApplicationOffer[];
    };
  };
}

export interface CreateContractPayload {
  employeeId: string;
  startDate: string;
  endDate: string;
  contractType: number;
  salaryAmount: number;
  currency: string;
  status: number;
}

export interface ContractGraphQLResponse {
  id: string,
  employeeId: string,
  startDate: string,
  endDate: string,
  typee: number,
  salaryAmount: number,
  salaryCurrency: string,
  status: number
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  private readonly _HttpClient = inject(HttpClient);

  addInterviewProcess(data: CreateProcessPayload) {
    return this._HttpClient.post(
      `${Environment.baseUrl}/api/InterviewProcesss/add`,
      data
    );
  }

  deleteInterviewProcess(id: string) {
    return this._HttpClient.delete(
      `${Environment.baseUrl}/api/InterviewProcesss/Delete`,
      { params: { id } }
    );
  }

  addInterview(data: CreateInterviewPayload) {
    return this._HttpClient.post(
      `${Environment.baseUrl}/api/interview/add`,
      data
    );
  }


  updateInterview(data: UpdateInterviewPayload) {
    return this._HttpClient.put(
      `${Environment.baseUrl}/api/interviews/update`,
      data
    );
  }

  deleteInterview(id: string) {
    return this._HttpClient.delete(
      `${Environment.baseUrl}/api/interviews/delete?id=${id}`
    );
  }

  addOffer(data: CreateOfferPayload) {
    return this._HttpClient.post(
      `${Environment.baseUrl}/api/Offer/add`,
      data
    );
  }

  acceptOffer(id: string) {
    return this._HttpClient.put(
      `${Environment.baseUrl}/api/offers/${id}/accept`,
      {}
    );
  }

  rejectOffer(id: string) {
    return this._HttpClient.put(
      `${Environment.baseUrl}/api/offers/${id}/reject`,
      { id }
    );
  }

  addContract(data: CreateContractPayload) {
    return this._HttpClient.post(
      `${Environment.baseUrl}/api/contracts/add`,
      data
    );
  }

  // ✅ الصح
  deleteContract(id: string) {
    return this._HttpClient.delete(
      `${Environment.baseUrl}/api/contracts/Delete`,
      { params: { id } }
    );
  }


  // داخل الـ ApplicationsService class
  getOffers() {
    const query = `
    query {
      applicationOffers {
        nodes {
          id
          interviewId
          salaryAmount
          currencyCode
          expireDate
          offerStatus
          isAvailable
        }
      }
    }
  `;

    return this._HttpClient
      .post<OffersGraphQLResponse>(`${Environment.baseUrl}/graphql`, { query })
      .pipe(map((res) => res.data.applicationOffers.nodes));
  }

  getContracts() {
    const query = `
    query {
      contracts {
        nodes {
          id
          employeeId
          startDate
          endDate
          typee
          salaryAmount
          salaryCurrency
          status
        }
      }
    }
  `;
    return this._HttpClient
      .post<ContractsGraphQLResponse>(`${Environment.baseUrl}/graphql`, { query })
      .pipe(map((res) => res.data.contracts.nodes)); // ← صلحنا applicationOffers → contracts
  }

  getContractById(id: string) {
    const query = `
    query {
      contract(id: "${id}") {
        id
        employeeId
        startDate
        endDate
        typee
        salaryAmount
        salaryCurrency
        status
      }
    }
  `;
    return this._HttpClient
      .post<{ data: { contract: ApplicationContract } }>(
        `${Environment.baseUrl}/graphql`,
        { query }
      )
      .pipe(map((res) => res.data.contract));
  }

  getInterviews() {
    const query = `
    query {
      applicationInterviews {
        nodes {
          id
          applicationProcessId
          interviewerName
          interviewDate
          location
          interviewType
          stage
        }
      }
    }
  `;
    return this._HttpClient
      .post<any>(`${Environment.baseUrl}/graphql`, { query })
      .pipe(map((res) => res.data.applicationInterviews.nodes));
  }


  getOfferById(id: string) {
    const query = `
    query {
      applicationOffer(id: "${id}") {
        id
        interviewId
        salaryAmount
        currencyCode
        expireDate
        offerStatus
        isAvailable
      }
    }
  `;

    return this._HttpClient
      .post<{ data: { applicationOffer: ApplicationOffer } }>(
        `${Environment.baseUrl}/graphql`,
        { query }
      )
      .pipe(map(res => res.data.applicationOffer));
  }

}