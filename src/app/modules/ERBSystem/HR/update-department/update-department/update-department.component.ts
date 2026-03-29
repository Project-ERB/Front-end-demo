import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

interface DepartmentHead {
  id: number;
  name: string;
  title: string;
}

interface NavItem {
  icon: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-update-department',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-department.component.html',
  styleUrl: './update-department.component.scss',
})
export class UpdateDepartmentComponent {

  departmentForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  /** Capacity stats (would normally come from an API) */
  employeeCount = 42;
  employeeCapacity = 50;
  get capacityPercent(): number {
    return Math.round((this.employeeCount / this.employeeCapacity) * 100);
  }

  departmentHeads: DepartmentHead[] = [
    { id: 1, name: 'Sarah Johnson', title: 'CTO' },
    { id: 2, name: 'Michael Chen', title: 'VP of Engineering' },
    { id: 3, name: 'Elena Rodriguez', title: 'Director of Product' },
    { id: 4, name: 'David Smith', title: 'Tech Lead' },
  ];

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Employees', active: false },
    { icon: 'hub', label: 'Departments', active: true },
    { icon: 'payments', label: 'Payroll', active: false },
    { icon: 'settings', label: 'Settings', active: false },
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // Pre-populated with existing department data
    this.departmentForm = this.fb.group({
      name: ['Product Engineering', [Validators.required, Validators.minLength(2)]],
      code: ['ENG-PROD-01', [Validators.required, Validators.pattern(/^[A-Z0-9-]{2,15}$/)]],
      headId: [2, Validators.required],
      description: [
        'Responsible for building and maintaining the core software infrastructure, ensuring high performance, scalability, and user-centric features for the primary product lines.',
        Validators.maxLength(500),
      ],
      annualBudget: ['2,450,000', Validators.required],
      costCenter: ['CC-8829-ENG', Validators.required],
    });
  }

  get nameControl() { return this.departmentForm.get('name'); }
  get codeControl() { return this.departmentForm.get('code'); }
  get descriptionControl() { return this.departmentForm.get('description'); }
  get budgetControl() { return this.departmentForm.get('annualBudget'); }
  get costCenterControl() { return this.departmentForm.get('costCenter'); }

  isFieldInvalid(field: string): boolean {
    const c = this.departmentForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    setTimeout(() => {
      console.log('Department Updated:', this.departmentForm.value);
      this.isSubmitting = false;
      this.submitSuccess = true;
      setTimeout(() => (this.submitSuccess = false), 3500);
    }, 1200);
  }

  onDiscard(): void {
    this.departmentForm.reset({
      name: 'Product Engineering',
      code: 'ENG-PROD-01',
      headId: 2,
      description:
        'Responsible for building and maintaining the core software infrastructure, ensuring high performance, scalability, and user-centric features for the primary product lines.',
      annualBudget: '2,450,000',
      costCenter: 'CC-8829-ENG',
    });
  }
}
