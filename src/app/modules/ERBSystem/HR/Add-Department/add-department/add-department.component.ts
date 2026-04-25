import { DepartmentService } from './../../../../../core/services/Auth/department/department.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup,
  Validators, ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";

interface DepartmentHead { id: string; name: string; title: string; }

@Component({
  selector: 'app-add-department',
  imports: [CommonModule, ReactiveFormsModule, HrSidebarComponent],
  templateUrl: './add-department.component.html',
  styleUrl: './add-department.component.scss',
})
export class AddDepartmentComponent implements OnInit {

  departmentForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  // الـ managerId الثابت — غيّره لما الباك اند يضيف endpoint لجلب المديرين
  readonly MANAGER_ID = '6730cfb3-8a7f-4b5e-9b8f-884dddfa01e0';

  departmentHeads: DepartmentHead[] = [
    { id: '1', name: 'John Smith', title: 'Chief Engineer' },
    { id: '2', name: 'Sarah Jenkins', title: 'VP Sales' },
    { id: '3', name: 'Michael Brown', title: 'Head of HR' },
    { id: '4', name: 'Emily Davis', title: 'Lead Designer' },
  ];

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Employees', active: false },
    { icon: 'schema', label: 'Departments', active: true },
    { icon: 'payments', label: 'Payroll', active: false },
    { icon: 'description', label: 'Reports', active: false },
  ];

  constructor(
    private fb: FormBuilder,
    private _DepartmentService: DepartmentService,
    private _Router: Router,
    private _ToastrService: ToastrService,
  ) { }

  ngOnInit(): void {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      // code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{2,10}$/)]],
      // headId: [''],
      description: ['', Validators.maxLength(500)],
    });
  }

  // ── Getters ───────────────────────────────────────────
  get nameControl() { return this.departmentForm.get('name'); }
  get codeControl() { return this.departmentForm.get('code'); }
  get descriptionControl() { return this.departmentForm.get('description'); }

  isFieldInvalid(field: string): boolean {
    const c = this.departmentForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Submit ────────────────────────────────────────────
  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const v = this.departmentForm.value;

    const payload = {
      name: v.name,
      description: v.description ?? '',
      managerId: this.MANAGER_ID,   // hardcoded لحد ما الباك اند يضيف endpoint للمديرين
      isActive: true,
    };
    this._DepartmentService.addDepartment(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this._ToastrService.success('Department created successfully!', 'Success!');
        this.departmentForm.reset();
        setTimeout(() => {
          this.submitSuccess = false;
          this._Router.navigate(['/hr-department']);
        }, 2500);
      },
      error: (err) => {
        this.isSubmitting = false;
        const message =
          err?.error?.reasons?.[0]?.message ||
          err?.error?.errors?.[0]?.message ||
          'Something went wrong';
        this._ToastrService.error(message, 'Failed!');
      },
    });
  }

  onDiscard(): void {
    this.departmentForm.reset();
  }
}