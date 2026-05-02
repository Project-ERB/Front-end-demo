import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationsService, CreateProcessPayload } from '../../../../../core/services/Applications/applications.service';
import { CandidateService } from '../../../../../core/services/candidate/candidate.service';
import { JopService } from '../../../../../core/services/jop/jop.service';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface ProcessForm {
  candidateId: string | null;
  recrutmentId: string | null;
  currentStage: number;
  appStatus: number;
  startDate: string;
}

@Component({
  selector: 'app-add-application',
  imports: [CommonModule, FormsModule, HrSidebarComponent],
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.scss',
})
export class AddApplicationComponent implements OnInit {
  private readonly _applicationsService = inject(ApplicationsService);
  private readonly _candidateService = inject(CandidateService);
  private readonly _jobService = inject(JopService);
  private readonly _router = inject(Router);
  private readonly _toastr = inject(ToastrService);

  candidates: any[] = [];
  jobs: any[] = [];
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  stages = [
    { value: 0, label: 'Initial Screening' },
    { value: 1, label: 'Technical Assessment' },
    { value: 2, label: 'Culture Fit Interview' },
    { value: 3, label: 'Offer Preparation' },
  ];

  appStatuses = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Active' },
    { value: 2, label: 'Rejected' },
    { value: 3, label: 'Hired' },
  ];

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'person_search', label: 'Candidates', active: false },
    { icon: 'work', label: 'Jobs', active: false },
    { icon: 'description', label: 'Applications', active: true },
    { icon: 'analytics', label: 'Reports', active: false },
  ];

  form: ProcessForm = {
    candidateId: null,
    recrutmentId: null,
    currentStage: 0,
    appStatus: 0,
    startDate: '',
  };

  ngOnInit(): void {
    // ← getCandidates بترجع nodes مباشرة مش res
    this._candidateService.getCandidates().subscribe({
      next: (nodes) => {
        this.candidates = nodes;
      },
    });

    this._jobService.getRecruitments().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
      },
    });
  }

  onSubmit(): void {
    if (!this.form.candidateId || !this.form.recrutmentId || !this.form.startDate) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateProcessPayload = {
      candidateId: this.form.candidateId!,
      recrutmentId: this.form.recrutmentId!,
      currentStage: this.form.currentStage,
      appStatus: this.form.appStatus,
      startDate: this.form.startDate,
    };

    this._applicationsService.addInterviewProcess(payload).subscribe({
      next: (res) => {
        this._toastr.success('Process created successfully!', 'Success');
        this.isSubmitting = false;
        this.onCancel();
        console.log('Process created:', res);
        setTimeout(() => {
          this._router.navigate(['/application-management']);
        }, 1000);
      },
      error: (err) => {
        this._toastr.error('Failed to create process. Please try again.', 'Error');
        console.error('Error creating process:', err);
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.form = {
      candidateId: null,
      recrutmentId: null,
      currentStage: 0,
      appStatus: 0,
      startDate: '',
    };
  }
}