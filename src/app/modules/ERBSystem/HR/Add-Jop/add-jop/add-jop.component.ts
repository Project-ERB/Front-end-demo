import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JopService } from '../../../../../core/services/Auth/jop/jop.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";

export interface NavItem {
  icon: string;
  label: string;
  active: boolean;
}

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
export class AddJopComponent {
  readonly _JopService = inject(JopService);
  private readonly _ToastrService = inject(ToastrService);
  form: FormGroup;
  isSaving = signal(false);

  readonly navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'work', label: 'Jobs', active: false },
    { icon: 'group', label: 'Candidates', active: false },
    { icon: 'description', label: 'Requirements', active: true },
    { icon: 'settings', label: 'Settings', active: false },
  ];

  readonly departments: SelectOption[] = [
    { value: '', label: 'Select Department' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'product', label: 'Product Management' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
  ];

  readonly currencies: SelectOption[] = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
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
      hiringManager: [''],
      currency: ['USD'],
      minSalary: [null, [Validators.min(0)]],
      maxSalary: [null, [Validators.min(0)]],
      experienceLevel: ['junior'],
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
      departmentsId: this.form.value.department,
      hiringManagerId: this.form.value.hiringManager ?? null,
    };

    this._JopService.addrequirements(payload).subscribe({
      next: (res) => {
        console.log('Saved successfully:', res);
        this._ToastrService.success('Job requirements added successfully!', 'Success');
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error saving:', err);
        this._ToastrService.error('Failed to add job requirements. Please try again.', 'Error');
        this.isSaving.set(false);
      }
    });
  }

  onCancel(): void {
    console.log('Cancelled');
  }

  onDiscard(): void {
    this.form.reset({ currency: 'USD', experienceLevel: 'junior' });
  }

  onSubmit(): void {
    this.onSave();
  }

}
