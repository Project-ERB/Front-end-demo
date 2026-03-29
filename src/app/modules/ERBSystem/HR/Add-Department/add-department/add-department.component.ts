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

@Component({
  selector: 'app-add-department',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-department.component.html',
  styleUrl: './add-department.component.scss',
})
export class AddDepartmentComponent {

  departmentForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  departmentHeads: DepartmentHead[] = [
    { id: 1, name: 'John Smith', title: 'Chief Engineer' },
    { id: 2, name: 'Sarah Jenkins', title: 'VP Sales' },
    { id: 3, name: 'Michael Brown', title: 'Head of HR' },
    { id: 4, name: 'Emily Davis', title: 'Lead Designer' },
  ];

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Employees', active: false },
    { icon: 'schema', label: 'Departments', active: true },
    { icon: 'payments', label: 'Payroll', active: false },
    { icon: 'description', label: 'Reports', active: false },
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z0-9-]{2,10}$/)],
      ],
      headId: [''],
      description: ['', Validators.maxLength(500)],
    });
  }

  get nameControl() {
    return this.departmentForm.get('name');
  }
  get codeControl() {
    return this.departmentForm.get('code');
  }
  get descriptionControl() {
    return this.departmentForm.get('description');
  }

  isFieldInvalid(field: string): boolean {
    const control = this.departmentForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    // Simulate an API call
    setTimeout(() => {
      console.log('Department Created:', this.departmentForm.value);
      this.isSubmitting = false;
      this.submitSuccess = true;
      setTimeout(() => (this.submitSuccess = false), 3000);
    }, 1200);
  }

  onDiscard(): void {
    this.departmentForm.reset();
  }
}
