import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ApplicationsService, CreateOfferPayload } from '../../../../../core/services/Applications/applications.service';
import { Environment } from '../../../../../shared/UI/environment/env';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

export interface Interview {
  id: string;
  applicationProcessId: string;
  interviewerName: string;
  interviewDate: string;
  location: string;
  interviewType: number;
  stage: number;
}

export interface OfferForm {
  interviewId: string;
  salary: number | null;
  currency: string;
  expirationDate: string;
  isActive: boolean;
  notes: string;
}

@Component({
  selector: 'app-add-offer',
  imports: [CommonModule, FormsModule, HrSidebarComponent],
  templateUrl: './add-offer.component.html',
  styleUrl: './add-offer.component.scss',
})
export class AddOfferComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _ApplicationsService = inject(ApplicationsService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _Router = inject(Router)

  allInterviews: Interview[] = [];
  isLoading = false;

  readonly navLinks = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'person_search', label: 'Recruitment', active: false },
    { icon: 'description', label: 'Offers', active: true },
    { icon: 'group', label: 'Employees', active: false },
    { icon: 'settings', label: 'Settings', active: false },
  ];

  readonly currencyOptions = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
  ];

  form: OfferForm = {
    interviewId: '',
    salary: null,
    currency: 'USD',
    expirationDate: '',
    isActive: true,
    notes: '',
  };

  searchQuery = '';

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
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

    this._http
      .post<any>(`${Environment.baseUrl}/graphql`, { query })
      .pipe(map((res) => res.data.applicationInterviews.nodes as Interview[]))
      .subscribe({ next: (data) => (this.allInterviews = data) });
  }

  onSubmit(): void {
    if (!this.form.interviewId || !this.form.salary || !this.form.expirationDate) {
      alert('Please fill all required fields');
      return;
    }

    const payload: CreateOfferPayload = {
      interviewId: this.form.interviewId,
      salary: this.form.salary,
      currency: this.form.currency,
      expireDate: this.form.expirationDate,
      of: 0,
      isActive: this.form.isActive,
    };

    this.isLoading = true;

    this._ApplicationsService.addOffer(payload).subscribe({
      next: (res) => {
        this._ToastrService.success('offer add successfully!', 'Success !')
        console.log('Offer created:', res);
        this.isLoading = false;
        this.onCancel();
        setTimeout(() => {
          this._Router.navigate(['/offer-management'])
        }, 2000);
      },
      error: (err) => {
        this._ToastrService.error('offer add failed!', 'Failed !')
        console.error('Error:', err);
        this.isLoading = false;
      },
    });
  }

  onCancel(): void {
    this.form = {
      interviewId: '',
      salary: null,
      currency: 'USD',
      expirationDate: '',
      isActive: true,
      notes: '',
    };
  }
}