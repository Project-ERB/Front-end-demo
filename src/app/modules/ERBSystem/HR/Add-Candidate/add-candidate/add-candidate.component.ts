import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidateService } from '../../../../../core/services/candidate/candidate.service';
import { ToastrService } from 'ngx-toastr';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { Router } from '@angular/router';

export interface NavItem {
  icon: string;
  label: string;
  active: boolean;
  filled?: boolean;
}

@Component({
  selector: 'app-add-candidate',
  imports: [CommonModule, ReactiveFormsModule, HrSidebarComponent],
  templateUrl: './add-candidate.component.html',
  styleUrl: './add-candidate.component.scss',
})
export class AddCandidateComponent {
  private readonly _CandidateService = inject(CandidateService);
  private readonly _ToastrService = inject(ToastrService);

  showMobileSearch = false;

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  }

  uploadedFileName = signal<string | null>(null);
  submitted = signal(false);
  isSaving = signal(false);

  readonly fillStyle = "'FILL' 1";
  readonly outlineStyle = "'FILL' 0";

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Candidates', active: true, filled: true },
    { icon: 'work', label: 'Jobs', active: false },
    { icon: 'calendar_today', label: 'Interviews', active: false },
    { icon: 'settings', label: 'Settings', active: false },
  ];

  jobTitles = [
    'Senior Frontend Engineer',
    'Product Designer',
    'DevOps Architect',
    'Marketing Manager',
    'Backend Developer',
    'Data Analyst',
    'QA Engineer',
    'Cloud Architect',
  ];

  currencies = ['USD', 'EUR', 'GBP', 'INR'];

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Personal
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['', Validators.required],
      phone: ['', Validators.required],
      // Address
      addressStreet: [''],
      addressCity: ['', Validators.required],
      addressState: [''],
      addressPostalCode: [''],
      addressCountry: ['', Validators.required],
      // Professional
      jobTitle: ['', Validators.required],
      expYears: [null, [Validators.required, Validators.min(0), Validators.max(50)]],
      currency: ['USD'],
      salary: [''],
      resumeUrl: ['', [Validators.pattern('https?://.+')]],
    });
  }

  get f() { return this.form.controls; }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submitted()));
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadedFileName.set(input.files[0].name);
    }
  }

  onReset(): void {
    this.form.reset({ currency: 'USD' });
    this.uploadedFileName.set(null);
    this.submitted.set(false);
  }

  private readonly _Router = inject(Router)

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.isSaving.set(true);

    const v = this.form.value;

    const payload = {
      fullName: v.fullName,
      email: v.email,
      countryCode: v.countryCode,
      phoneNumber: v.phone,
      addressCountry: v.addressCountry,
      addressCity: v.addressCity,
      addressStreet: v.addressStreet ?? '',
      addressPostalCode: v.addressPostalCode ?? '',
      addressState: v.addressState ?? '',
      jobTitle: v.jobTitle,
      expectedSalaryAmount: v.salary ? Number(v.salary.toString().replace(/,/g, '')) : 0,
      expectedSalaryCurrency: v.currency,
      resumeUrl: v.resumeUrl?.trim() ? v.resumeUrl : 'https://placeholder.com/resume.pdf',
      experienceInYears: v.expYears,
    };

    this._CandidateService.addCandidate(payload).subscribe({
      next: () => {
        this._ToastrService.success('Candidate created successfully!', 'Success');
        this.isSaving.set(false);
        this.onReset();
        setTimeout(() => {
          this._Router.navigate(['/Candidate-Management'])
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this._ToastrService.error('Failed to create candidate. Please try again.', 'Error');
        this.isSaving.set(false);
      },
    });
  }
}