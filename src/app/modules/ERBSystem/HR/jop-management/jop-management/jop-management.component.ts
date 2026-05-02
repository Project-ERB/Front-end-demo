import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { JopService } from '../../../../../core/services/jop/jop.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-jop-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HrSidebarComponent],
  templateUrl: './jop-management.component.html',
  styleUrl: './jop-management.component.scss',
})
export class JopManagementComponent implements OnInit {
  private readonly _Router = inject(Router);
  private readonly _JopService = inject(JopService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _fb = inject(FormBuilder);

  searchQuery = '';
  allRequirements: any[] = [];
  departmentMap: Record<string, string> = {};
  isLoading = true;

  // Modal
  showModal = false;
  selectedReq: any = null;
  isSaving = false;

  salaryForm: FormGroup = this._fb.group({
    minSalaryAmount: [null, [Validators.required, Validators.min(0)]],
    maxSalaryAmount: [null, [Validators.required, Validators.min(0)]],
    salaryCurrency: ['USD', Validators.required],
  });

  readonly currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'EGP', label: 'EGP (ج.م)' },
  ];

  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    forkJoin({
      recruitments: this._JopService.getRecruitments(),
      departments: this._JopService.getDepartments(),
    }).subscribe({
      next: ({ recruitments, departments }) => {
        this.departmentMap = Object.fromEntries(departments.map((d: any) => [d.id, d.name]));
        this.allRequirements = recruitments;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  // ── Modal ──────────────────────────────────────────
  openEditSalary(req: any): void {
    this.selectedReq = req;
    this.salaryForm.patchValue({
      minSalaryAmount: req.minSalaryAmount,
      maxSalaryAmount: req.maxSalaryAmount,
      salaryCurrency: req.minSalaryCurrency ?? 'USD',
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReq = null;
  }

  onSaveSalary(): void {
    if (this.salaryForm.invalid) return;
    this.isSaving = true;

    const payload = {
      recrumentId: this.selectedReq.id,
      minSalaryAmount: this.salaryForm.value.minSalaryAmount,
      maxSalaryAmount: this.salaryForm.value.maxSalaryAmount,
      salaryCurrency: this.salaryForm.value.salaryCurrency,
    };

    this._JopService.updateSalary(payload).subscribe({
      next: () => {
        // Update local data
        const idx = this.allRequirements.findIndex(r => r.id === this.selectedReq.id);
        if (idx !== -1) {
          this.allRequirements[idx] = {
            ...this.allRequirements[idx],
            minSalaryAmount: payload.minSalaryAmount,
            maxSalaryAmount: payload.maxSalaryAmount,
            minSalaryCurrency: payload.salaryCurrency,
            maxSalaryCurrency: payload.salaryCurrency,
          };
        }
        this._ToastrService.success('Salary updated successfully!', 'Success');
        this.isSaving = false;
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        this._ToastrService.error('Failed to update salary.', 'Error');
        this.isSaving = false;
      },
    });
  }

  // ── Helpers ────────────────────────────────────────
  getDepartmentName(id: string): string { return this.departmentMap[id] ?? '—'; }

  get totalRequirements(): number { return this.filteredRequirements.length; }
  get totalPages(): number { return Math.ceil(this.totalRequirements / this.pageSize); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  get filteredRequirements(): any[] {
    if (!this.searchQuery.trim()) return this.allRequirements;
    const q = this.searchQuery.toLowerCase();
    return this.allRequirements.filter(r =>
      r.title.toLowerCase().includes(q) ||
      this.getDepartmentName(r.departmentId).toLowerCase().includes(q)
    );
  }

  get paginatedRequirements(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRequirements.slice(start, start + this.pageSize);
  }

  formatSalary(value: number): string { return value?.toLocaleString('en-US') ?? '0'; }

  experienceBadgeClass(level: string): string {
    switch (level?.toLowerCase()) {
      case 'senior': return 'bg-orange-100 text-orange-700';
      case 'mid':
      case 'mid-level': return 'bg-blue-100 text-blue-700';
      case 'junior': return 'bg-green-100 text-green-700';
      case 'expert': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onView(req: any): void {
    this._Router.navigate(['/jop-details', req.id]);
  }


  onDelete(req: any): void {
    if (!confirm(`Delete "${req.title}"?`)) return;

    this._JopService.deleteRecruitment(req.id).subscribe({
      next: () => {
        this.allRequirements = this.allRequirements.filter(r => r.id !== req.id);
        this._ToastrService.success('Requirement deleted successfully!', 'Success');
      },
      error: (err) => {
        console.error(err);
        this._ToastrService.error('Failed to delete requirement.', 'Error');
      },
    });
  }
  onAddNew(): void { this._Router.navigate(['/add-jop-requierments']); }
}