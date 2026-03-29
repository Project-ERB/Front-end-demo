import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ContractForm {
  contractType: string;
  status: string;
  startDate: string;
  endDate: string;
  annualSalary: string;
  paymentFrequency: string;
}

@Component({
  selector: 'app-update-contract',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './update-contract.component.html',
  styleUrl: './update-contract.component.scss',
})
export class UpdateContractComponent {

  contractForm!: FormGroup;

  employeeName = 'Sarah Jenkins';
  contractId = 'CNT-2024-089';
  lastModifiedBy = 'Admin_User';
  lastModifiedOn = 'Oct 12, 2023 at 04:30 PM';

  contractTypes = [
    { label: 'Full-time Permanent', value: 'full-time-permanent' },
    { label: 'Fixed Term', value: 'fixed-term' },
    { label: 'Contractor / Freelance', value: 'contractor-freelance' },
    { label: 'Part-time', value: 'part-time' },
  ];

  statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Pending Approval', value: 'pending' },
    { label: 'Expired', value: 'expired' },
    { label: 'Terminated', value: 'terminated' },
  ];

  paymentFrequencies = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Bi-weekly', value: 'bi-weekly' },
    { label: 'Weekly', value: 'weekly' },
  ];

  statusDotClass: Record<string, string> = {
    active: 'bg-emerald-500',
    pending: 'bg-amber-400',
    expired: 'bg-slate-400',
    terminated: 'bg-red-500',
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.contractForm = this.fb.group({
      contractType: ['fixed-term', Validators.required],
      status: ['active', Validators.required],
      startDate: ['2024-01-15', Validators.required],
      endDate: ['2025-01-14', Validators.required],
      annualSalary: ['85,000.00', Validators.required],
      paymentFrequency: ['monthly', Validators.required],
    });
  }

  get currentStatusDot(): string {
    const status = this.contractForm.get('status')?.value;
    return this.statusDotClass[status] ?? 'bg-slate-400';
  }

  onSubmit(): void {
    if (this.contractForm.valid) {
      console.log('Contract Updated:', this.contractForm.value);
      // Handle form submission
    }
  }

  onCancel(): void {
    this.contractForm.reset();
    // Handle cancel action
  }

}
