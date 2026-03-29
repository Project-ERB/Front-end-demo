import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface NavItem {
  icon: string;
  label: string;
  active: boolean;
  filled?: boolean;
}

@Component({
  selector: 'app-add-candidate',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-candidate.component.html',
  styleUrl: './add-candidate.component.scss',
})
export class AddCandidateComponent {
  // ── State ──────────────────────────────────────────────────────────────────
  uploadedFileName = signal<string | null>(null);
  submitted = signal(false);

  readonly fillStyle = "'FILL' 1";
  readonly outlineStyle = "'FILL' 0";

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Candidates', active: true, filled: true },
    { icon: 'work', label: 'Jobs', active: false },
    { icon: 'calendar_today', label: 'Interviews', active: false },
    { icon: 'settings', label: 'Settings', active: false },
  ];

  jobTitles = [
    'Senior Frontend Engineer',
    'Product Designer',
    'DevOps Architect',
    'Marketing Manager',
    'Backend Developer',
    'Data Analyst',
    'QA Engineer',
    'Cloud Architect',
  ];

  currencies = ['USD', 'EUR', 'GBP', 'INR'];

  // ── Form ───────────────────────────────────────────────────────────────────
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Personal
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      // Professional
      jobTitle: ['', Validators.required],
      expYears: [null, [Validators.required, Validators.min(0), Validators.max(50)]],
      currency: ['USD'],
      salary: [''],
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  get f() { return this.form.controls; }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submitted()));
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadedFileName.set(input.files[0].name);
    }
  }

  onReset(): void {
    this.form.reset({ currency: 'USD' });
    this.uploadedFileName.set(null);
    this.submitted.set(false);
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    // TODO: wire to service
    console.log('Candidate payload:', this.form.value);
    alert(`Candidate "${this.form.value.fullName}" created successfully!`);
    this.onReset();
  }
}
