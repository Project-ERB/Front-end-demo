import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class AddContractComponent {

  employees: Employee[] = [
    { id: '1', name: 'Jordan Smith', empId: 'EMP-001' },
    { id: '2', name: 'Sarah Connor', empId: 'EMP-042' },
    { id: '3', name: 'Marcus Wright', empId: 'EMP-115' },
  ];

  contractTypes = [
    { value: 'ft', label: 'Full-time Permanent' },
    { value: 'pt', label: 'Part-time' },
    { value: 'fixed', label: 'Fixed-term Contract' },
    { value: 'intern', label: 'Internship' },
  ];

  managers: Manager[] = [
    { value: 'jane', label: 'Jane Doe (Engineering)' },
    { value: 'bob', label: 'Robert Vance (Marketing)' },
    { value: 'claire', label: 'Claire Redfield (Security)' },
  ];

  form = {
    employeeId: '',
    contractType: '',
    startDate: '',
    endDate: '',
    salary: null as number | null,
    status: 'draft',
    managerId: 'jane',
  };

  onSave(): void {
    console.log('Saving contract:', this.form);
  }

  onCancel(): void {
    this.form = {
      employeeId: '',
      contractType: '',
      startDate: '',
      endDate: '',
      salary: null,
      status: 'draft',
      managerId: 'jane',
    };
  }

  getStatusBorderClass(value: string): string {
    return this.form.status === value
      ? 'border-[#2563EB] bg-[#2563EB]/5'
      : 'border-slate-200 dark:border-slate-700';
  }

}
