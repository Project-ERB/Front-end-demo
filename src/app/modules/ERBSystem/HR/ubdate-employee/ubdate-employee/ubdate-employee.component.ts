import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-ubdate-employee',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ubdate-employee.component.html',
  styleUrl: './ubdate-employee.component.scss',
})
export class UbdateEmployeeComponent {

  employeeForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  employeeStatus: 'Active' | 'On Leave' = 'Active';

  /** Tracks how many fields have been dirtied */
  get changedFieldCount(): number {
    return Object.values(this.employeeForm?.controls ?? {}).filter(
      (c) => c.dirty
    ).length;
  }

  departments = ['Engineering', 'Design', 'Marketing', 'Product', 'Operations'];
  levels = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Director'];
  employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];
  managers = ['Sarah Miller', 'David Chen', 'Maria Garcia'];
  payrollFrequencies = ['Weekly', 'Bi-Weekly', 'Monthly'];

  navLinks = [
    { label: 'Dashboard', active: false },
    { label: 'Employees', active: true },
    { label: 'Reports', active: false },
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      // Personal
      fullName: ['Alex Johnson', [Validators.required, Validators.minLength(2)]],
      email: ['alex.j@company.com', [Validators.required, Validators.email]],
      phone: ['+1 (555) 012-3456', Validators.required],
      birthDate: ['1992-05-15', Validators.required],
      address: ['742 Evergreen Terrace, Springfield, IL 62704', Validators.required],
      // Employment
      department: ['Design', Validators.required],
      level: ['Senior', Validators.required],
      employmentType: ['Full-Time', Validators.required],
      manager: ['David Chen', Validators.required],
      hireDate: ['2021-03-22', Validators.required],
      // Compensation
      salary: [125000, [Validators.required, Validators.min(0)]],
      payrollFrequency: ['Bi-Weekly', Validators.required],
    });
  }

  get f() { return this.employeeForm.controls; }

  isFieldInvalid(field: string): boolean {
    const c = this.employeeForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  setStatus(status: 'Active' | 'On Leave'): void {
    this.employeeStatus = status;
    this.employeeForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    setTimeout(() => {
      console.log('Employee Updated:', {
        ...this.employeeForm.value,
        status: this.employeeStatus,
      });
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.employeeForm.markAsPristine();
      setTimeout(() => (this.submitSuccess = false), 3500);
    }, 1200);
  }

  onCancel(): void {
    this.employeeForm.reset({
      fullName: 'Alex Johnson',
      email: 'alex.j@company.com',
      phone: '+1 (555) 012-3456',
      birthDate: '1992-05-15',
      address: '742 Evergreen Terrace, Springfield, IL 62704',
      department: 'Design',
      level: 'Senior',
      employmentType: 'Full-Time',
      manager: 'David Chen',
      hireDate: '2021-03-22',
      salary: 125000,
      payrollFrequency: 'Bi-Weekly',
    });
    this.employeeStatus = 'Active';
  }
}
