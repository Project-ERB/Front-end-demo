import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

interface NavItem {
  icon: string;
  label: string;
  active: boolean;
  section?: string; // optional section label above this item
}

@Component({
  selector: 'app-add-employee',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent {

  employeeForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Employees', active: true },
    { icon: 'payments', label: 'Payroll', active: false },
    { icon: 'bar_chart', label: 'Reports', active: false },
    { icon: 'settings', label: 'Settings', active: false, section: 'System' },
  ];

  departments = [
    { value: 'eng', label: 'Engineering' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'sales', label: 'Sales' },
  ];

  jobLevels = [
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'exec', label: 'Executive' },
  ];

  employeeTypes = [
    { value: 'full', label: 'Full-time' },
    { value: 'part', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' },
  ];

  managers = [
    { value: 'm1', label: 'Michael Scott' },
    { value: 'm2', label: 'Pam Beesly' },
    { value: 'm3', label: 'Dwight Schrute' },
  ];

  statusOptions: { value: string; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'probation', label: 'Probation' },
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      // Personal
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      birthDate: ['', Validators.required],
      address: ['', Validators.required],
      // Job
      department: ['', Validators.required],
      jobLevel: ['junior', Validators.required],
      employeeType: ['full', Validators.required],
      salary: [null, [Validators.required, Validators.min(1)]],
      manager: ['', Validators.required],
      hireDate: ['', Validators.required],
      status: ['active', Validators.required],
    });
  }

  get f() { return this.employeeForm.controls; }

  isFieldInvalid(field: string): boolean {
    const c = this.employeeForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    setTimeout(() => {
      console.log('New Employee:', this.employeeForm.value);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.employeeForm.reset({ jobLevel: 'junior', employeeType: 'full', status: 'active' });
      setTimeout(() => (this.submitSuccess = false), 3500);
    }, 1200);
  }

  onCancel(): void {
    this.employeeForm.reset({ jobLevel: 'junior', employeeType: 'full', status: 'active' });
  }
}
