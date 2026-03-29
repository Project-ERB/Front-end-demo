import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  designation: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface Department {
  name: string;
  code: string;
  head: string;
  location: string;
  description: string;
  totalStrength: number;
  budget: string;
}

@Component({
  selector: 'app-department-details',
  imports: [FormsModule, CommonModule],
  templateUrl: './department-details.component.html',
  styleUrl: './department-details.component.scss',
})
export class DepartmentDetailsComponent {

  filterQuery = '';
  currentPage = 1;
  totalPages = [1, 2, 3];

  department: Department = {
    name: 'Engineering & Tech',
    code: 'DEPT-ENG-2024',
    head: 'Dr. Sarah Jenkins',
    location: 'San Francisco, HQ',
    description:
      'Responsible for end-to-end product development, infrastructure maintenance, and R&D for next-generation HR automation tools. The team comprises frontend, backend, and DevOps engineers dedicated to shipping high-quality software solutions.',
    totalStrength: 42,
    budget: '$1.2M',
  };

  employees: Employee[] = [
    {
      id: 'EMP-4012',
      name: 'David Miller',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDaTr_vcvDTtbZNzQ-uIKKU_Ur4dTLVlTPbFLbEpMUC4LzAEYFdFLcfebPegP6xD6QwBNZzg-4AcYTeZs5t7DNSG9OELsXjmVBWbbiMoTUIg7730myhkwI7WYrIOjIdpc1zOfb9J_iCrBsmLsfr3yFgzNd8NZpMOeRMYyZcw2vOVRdyKezUcaZJeem8dT5wBRpQbE8MIU5jyInRpCbMn5gcwQQg8WiAUN2FCOvvdkJaEsZKbvSF_qec9DafiUIKQJ6vJwgM-8aW2yuf',
      designation: 'Senior Software Architect',
      email: 'd.miller@company.com',
      status: 'Active',
    },
    {
      id: 'EMP-4089',
      name: 'Lisa Wong',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCzVYaIDggr4BKXvDCDg6mGMmc1Ewbjcio34Ev8O-gSh7LLvctKp5APqdKR-t0ioU_TfVKDIZGS25vCYqnKHNu1ePhw-Qhj8f35sGx6yurz2el1nhzqYQnSvU_XV9Vp671pgTyw680G9modrl2c_wGwYk0xH32keVh-M7JqT-tYGLKx7OZzf04SwnPsevT1CT537kZiRgsOE-evd4yd2taKQLHvLIPu8StxdbFRoKpqAf5n5_BOGxI1qkPfJ3BfWwTp8LdR-S-7Xrbk',
      designation: 'Product Manager',
      email: 'lisa.w@company.com',
      status: 'Active',
    },
    {
      id: 'EMP-3921',
      name: 'Marcus Sterling',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA1IzrbtsxCNR2NCCwdkU2uqGj08MYXlRex6W61kQvb7ckwLL8eahh2WpAcRD17z6yHKyolyHg1LBNxT2gmQnR05ZvB4JuCj9sQwDUrbaHj-SOz_WQ_2YFzAiNvpA67maM0I2IIcuqjdwH9HkApZPI0Lkrk_8VLp_OM-feRUczYmiHkxWQjC1pmRF84I-HVmYZU8lMGYPu0ZXLF8boKcv9i4lKbFmr1lhskumnKv_SQdR80DH1D63LNtGnfwTFDvnJdp7ENPGj0qn9G',
      designation: 'Senior DevOps Lead',
      email: 'm.sterling@company.com',
      status: 'On Leave',
    },
    {
      id: 'EMP-4211',
      name: 'Rachel Adams',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCM4-_RcUvwOACF1cCAEGs9u77VMghDSyq1z8yj2eDAZA0nUiUyqLkjPCSCgJPcFTQQgGztQ42PEquvr--T67ZLS2mFMEdjQPEMlyQMP_EyBvpzQTrxnJ--Z-a-AIhKNKwv3WDELfVNtqrxAlNLniDdLSMe2ibGaVl3wuU6FSqXWvtejpz1EvNYwaFaY0EEpa4sLlFQATQx4hi6Vtwqfu9pyU_UlnbR2e0Dx6ZU_uPv00xzlZMVvdjcWTxLv74pMYYZP5XxIoM7-Y6-',
      designation: 'QA Engineer',
      email: 'r.adams@company.com',
      status: 'Active',
    },
  ];

  get filteredEmployees(): Employee[] {
    if (!this.filterQuery.trim()) return this.employees;
    const q = this.filterQuery.toLowerCase();
    return this.employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'On Leave':
        return 'bg-amber-100 text-amber-700';
      case 'Inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  setPage(page: number): void {
    this.currentPage = page;
  }

}
