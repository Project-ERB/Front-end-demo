import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface NavItem {
  icon: string;
  label: string;
  active: boolean;
  sectionLabel?: string; // Optional label rendered above this item
}

export interface SelectOption {
  value: string;
  label: string;
}

/** Simulates a requirement loaded from an API / route param */
export interface JobRequirementData {
  jobTitle: string;
  description: string;
  department: string;
  hiringManager: string;
  salaryMin: string;
  salaryMax: string;
  experienceLevel: string;
}

@Component({
  selector: 'app-update-jop',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-jop.component.html',
  styleUrl: './update-jop.component.scss',
})
export class UpdateJopComponent {

  form!: FormGroup;
  isSaving = signal(false);
  saveSuccess = signal(false);

  readonly navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'description', label: 'Requirements', active: true },
    { icon: 'group', label: 'Candidates', active: false },
    { icon: 'badge', label: 'Employees', active: false },
    { icon: 'settings', label: 'Settings', active: false, sectionLabel: 'System' },
  ];

  readonly departments: SelectOption[] = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'product', label: 'Product' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
  ];

  readonly experienceLevels: SelectOption[] = [
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'staff', label: 'Staff / Principal' },
  ];

  /** Pre-populated data — in a real app this comes from a route resolver or service */
  private readonly existingData: JobRequirementData = {
    jobTitle: 'Senior Frontend Engineer',
    description: 'Specialized in React, Tailwind and modern UI patterns.',
    department: 'engineering',
    hiringManager: 'Jane Doe',
    salaryMin: '120,000',
    salaryMax: '165,000',
    experienceLevel: 'senior',
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      jobTitle: [this.existingData.jobTitle, [Validators.required, Validators.minLength(3)]],
      description: [this.existingData.description, [Validators.required, Validators.minLength(10)]],
      department: [this.existingData.department, Validators.required],
      hiringManager: [this.existingData.hiringManager],
      salaryMin: [this.existingData.salaryMin],
      salaryMax: [this.existingData.salaryMax],
      experienceLevel: [this.existingData.experienceLevel, Validators.required],
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  onSaveChanges(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.saveSuccess.set(false);

    // Simulate async save
    setTimeout(() => {
      this.isSaving.set(false);
      this.saveSuccess.set(true);
      this.form.markAsPristine();
      console.log('Saved:', this.form.value);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }, 1200);
  }

  onDiscard(): void {
    this.form.reset(this.existingData);
    this.form.markAsPristine();
  }

  onCancel(): void {
    console.log('Navigate back to requirements list');
  }

}
