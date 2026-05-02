import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JopService } from '../../../../../core/services/jop/jop.service';
import { ToastrService } from 'ngx-toastr';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";

const HIRING_MANAGER_ID = '6730cfb3-8a7f-4b5e-9b8f-884dddfa01e0';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-add-jop',
  imports: [CommonModule, ReactiveFormsModule, HrSidebarComponent],
  templateUrl: './add-jop.component.html',
  styleUrl: './add-jop.component.scss',
})
export class AddJopComponent implements OnInit {
  readonly _JopService = inject(JopService);
  private readonly _ToastrService = inject(ToastrService);
  form: FormGroup;
  isSaving = signal(false);

  // Loaded dynamically from GraphQL
  departments: SelectOption[] = [{ value: '', label: 'Select Department' }];

  readonly currencies: SelectOption[] = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'EGP', label: 'EGP (LE)' },
    { value: 'JPY', label: 'JPY (¥)' },
  ];

  readonly experienceLevels: SelectOption[] = [
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'expert', label: 'Expert' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      jobTitle: ['', [Validators.required, Validators.minLength(3)]],
      jobDescription: ['', [Validators.required, Validators.minLength(20)]],
      department: ['', Validators.required],
      currency: ['USD'],
      minSalary: [null, [Validators.min(0)]],
      maxSalary: [null, [Validators.min(0)]],
      experienceLevel: ['junior'],
    });
  }

  ngOnInit(): void {
    this._JopService.getDepartments().subscribe({
      next: (data) => {
        this.departments = [
          { value: '', label: 'Select Department' },
          ...data.map((d) => ({ value: d.id, label: d.name })),
        ];
      },
      error: (err) => {
        console.error('Failed to load departments:', err);
        this._ToastrService.error('Failed to load departments.', 'Error');
      },
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving.set(true);

    const payload = {
      title: this.form.value.jobTitle,
      description: this.form.value.jobDescription,
      minSalaryAmount: this.form.value.minSalary ?? 0,
      maxSalaryAmount: this.form.value.maxSalary ?? 0,
      salaryCurrency: this.form.value.currency,
      experienceLevel: this.form.value.experienceLevel,
      departmentsId: this.form.value.department,   // ← the selected department ID (UUID)
      hiringManagerId: HIRING_MANAGER_ID,           // ← fixed manager ID
    };

    this._JopService.addrequirements(payload).subscribe({
      next: (res) => {
        this._ToastrService.success('Job requirements added successfully!', 'Success');
        this.form.reset({ currency: 'USD', experienceLevel: 'junior' });
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error saving:', err);
        this._ToastrService.error('Failed to add job requirements. Please try again.', 'Error');
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void { }

  onDiscard(): void {
    this.form.reset({ currency: 'USD', experienceLevel: 'junior' });
  }

  onSubmit(): void {
    this.onSave();
  }
}