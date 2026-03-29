import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface InterviewOption {
  value: string;
  label: string;
}

export interface CurrencyOption {
  value: string;
  label: string;
}

export interface OfferForm {
  interviewId: string;
  salary: number | null;
  currency: string;
  expirationDate: string;
  isActive: boolean;
  notes: string;
}

@Component({
  selector: 'app-add-offer',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-offer.component.html',
  styleUrl: './add-offer.component.scss',
})
export class AddOfferComponent {

  // ── Sidebar nav ───────────────────────────────────────────
  readonly navLinks = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'person_search', label: 'Recruitment', active: false },
    { icon: 'description', label: 'Offers', active: true },
    { icon: 'group', label: 'Employees', active: false },
    { icon: 'settings', label: 'Settings', active: false },
  ];

  // ── Dropdown options ──────────────────────────────────────
  readonly interviewOptions: InterviewOption[] = [
    { value: '1', label: 'Sarah Jenkins - Senior Product Designer (INT-8842)' },
    { value: '2', label: 'Michael Chen - Fullstack Developer (INT-8843)' },
    { value: '3', label: 'Elena Rodriguez - Marketing Manager (INT-8845)' },
  ];

  readonly currencyOptions: CurrencyOption[] = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
  ];

  // ── Form model ────────────────────────────────────────────
  form: OfferForm = {
    interviewId: '',
    salary: null,
    currency: 'USD',
    expirationDate: '',
    isActive: true,
    notes: '',
  };

  searchQuery = '';

  // ── Actions ───────────────────────────────────────────────
  onSubmit(): void {
    console.log('Generating offer:', this.form);
    // TODO: wire to offer service
  }

  onCancel(): void {
    this.form = {
      interviewId: '',
      salary: null,
      currency: 'USD',
      expirationDate: '',
      isActive: true,
      notes: '',
    };
  }

}
