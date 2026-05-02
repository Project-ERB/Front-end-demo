import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationsService, CreateContractPayload } from '../../../../../core/services/Applications/applications.service';
import { inject } from '@angular/core';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';

export interface Employee {
  id: string;
  name: string;
  empId: string;
}

export interface Manager {
  value: string;
  label: string;
}

@Component({
  selector: 'app-add-contract',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-contract.component.html',
  styleUrl: './add-contract.component.scss',
})
export class AddContractComponent implements OnInit {
  private readonly _appService = inject(ApplicationsService);
  private readonly _employeeService = inject(EmployeeService);

  isLoading = false;

  employees: Employee[] = [];

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this._employeeService.getEmployees().subscribe({
      next: (res) => {

        this.employees = res.map(emp => ({
          id: emp.id,
          name: emp.name,
          empId: emp.nationalID || emp.id // لو عايز تعرض National ID بدل ID
        }));

        console.log(this.employees);
      },

      error: (err) => {
        console.error('Error loading employees:', err);
      }
    });
  }



  contractTypes = [
    { value: 0, label: 'Full-time Permanent' },
    { value: 1, label: 'Part-time' },
    { value: 2, label: 'Fixed-term Contract' },
    { value: 3, label: 'Internship' },
  ];

  managers: Manager[] = [
    { value: 'jane', label: 'Jane Doe (Engineering)' },
    { value: 'bob', label: 'Robert Vance (Marketing)' },
    { value: 'claire', label: 'Claire Redfield (Security)' },
  ];

  // status mapped to number: draft = 0, active = 1
  statusOptions = [
    { value: 0, label: 'Draft' },
    { value: 1, label: 'Active' },
  ];

  form = {
    employeeId: '',
    contractType: 0,
    startDate: '',
    endDate: '',
    salary: null as number | null,
    currency: 'USD',
    status: 0,   // 0 = Draft, 1 = Active
    managerId: 'jane',
  };

  onSave(): void {
    if (!this.form.employeeId || !this.form.startDate || !this.form.salary) {
      alert('Please fill all required fields');
      return;
    }

    const payload: CreateContractPayload = {
      employeeId: this.form.employeeId,
      startDate: this.form.startDate,
      endDate: this.form.endDate || this.form.startDate,
      contractType: this.form.contractType,
      salaryAmount: this.form.salary,
      currency: this.form.currency,
      status: this.form.status,
    };

    this.isLoading = true;

    this._appService.addContract(payload).subscribe({
      next: (res) => {
        console.log('Contract created:', res);
        this.isLoading = false;
        // TODO: navigate or show success toast
      },
      error: (err) => {
        console.error('Error creating contract:', err);
        this.isLoading = false;
      },
    });
  }

  onCancel(): void {
    this.form = {
      employeeId: '',
      contractType: 0,
      startDate: '',
      endDate: '',
      salary: null,
      currency: 'USD',
      status: 0,
      managerId: 'jane',
    };
  }

  getStatusBorderClass(value: number): string {
    return this.form.status === value
      ? 'border-[#2563EB] bg-[#2563EB]/5'
      : 'border-slate-200 dark:border-slate-700';
  }
}