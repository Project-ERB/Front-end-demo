import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HRComponent } from "../../../../core/layout/hr/hr.component";
import { HrSidebarComponent } from "../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { CandidateService } from '../../../../core/services/candidate/candidate.service';
import { ToastrService } from 'ngx-toastr';

export type CandidateStatus = 'Hired' | 'Interviewing' | 'New' | 'Rejected';

export interface Candidate {
  id: string; // ← string بدل number
  initials: string;
  initialsColor: string;
  name: string;
  jobTitle: string;
  expYears: number;
  email: string;
  status: CandidateStatus;
}

export type TabFilter = 'All Candidates' | 'New Application' | 'Interviewing' | 'Hired';

@Component({
  selector: 'app-candidate-management',
  imports: [CommonModule, FormsModule, HRComponent, HrSidebarComponent],
  templateUrl: './candidate-management.component.html',
  styleUrl: './candidate-management.component.scss',
})
export class CandidateManagementComponent {

  private readonly _Router = inject(Router);
  private readonly _CandidateService = inject(CandidateService);
  private readonly _ToastrService = inject(ToastrService)

  // ── State ──────────────────────────────────────────────────────────────────
  activeTab = signal<TabFilter>('All Candidates');
  filterText = signal<string>('');
  currentPage = signal<number>(1);
  readonly pageSize = 5;

  tabs: TabFilter[] = ['All Candidates', 'New Application', 'Interviewing', 'Hired'];

  navLinks = [
    { label: 'Dashboard', active: false },
    { label: 'Candidates', active: true },
    { label: 'Jobs', active: false },
    { label: 'Settings', active: false },
  ];

  // ── Data ───────────────────────────────────────────────────────────────────
  allCandidates = signal<Candidate[]>([]);

  // ── Derived ────────────────────────────────────────────────────────────────
  filteredCandidates = computed(() => {
    const tab = this.activeTab();
    const text = this.filterText().toLowerCase();

    const tabFiltered = tab === 'All Candidates'
      ? this.allCandidates()
      : this.allCandidates().filter(c => {
        if (tab === 'New Application') return c.status === 'New';
        if (tab === 'Interviewing') return c.status === 'Interviewing';
        if (tab === 'Hired') return c.status === 'Hired';
        return true;
      });

    return text
      ? tabFiltered.filter(c => c.name.toLowerCase().includes(text))
      : tabFiltered;
  });

  totalCount = computed(() => this.filteredCandidates().length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));

  pagedCandidates = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.filteredCandidates().slice(start, start + this.pageSize);
  });

  showingFrom = computed(() => Math.min((this.currentPage() - 1) * this.pageSize + 1, this.totalCount()));
  showingTo = computed(() => Math.min(this.currentPage() * this.pageSize, this.totalCount()));

  // ── Handlers ───────────────────────────────────────────────────────────────
  setTab(tab: TabFilter): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  onFilterChange(value: string): void {
    this.filterText.set(value);
    this.currentPage.set(1);
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────
  statusClasses(status: CandidateStatus): string {
    const map: Record<CandidateStatus, string> = {
      Hired: 'bg-green-100 text-green-800',
      Interviewing: 'bg-blue-100 text-blue-800',
      New: 'bg-slate-100 text-slate-700',
      Rejected: 'bg-red-100 text-red-800',
    };
    return map[status];
  }

  GoToAddCandidate(): void {
    this._Router.navigate(['/add-candidate']);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  deleteCandidate(id: string): void {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    this._CandidateService.deleteCandidate(id).subscribe({
      next: () => {
        this._ToastrService.success('Candidate Delete successfully', 'Success !')
        this.allCandidates.update(list => list.filter(c => c.id !== id));
      },
      error: (err) => {
        this._ToastrService.error('Candidate Delete Failed', 'Failed !')
      },
    });
  }

  constructor() {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this._CandidateService.getCandidates().subscribe({
      next: (nodes) => {
        this.allCandidates.set(nodes.map((c) => ({
          id: c.id,
          name: c.fullName,
          email: c.email,
          jobTitle: c.jobTitle,
          expYears: c.experienceInYears,
          status: 'New' as CandidateStatus,
          initials: c.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          initialsColor: 'bg-blue-100 text-blue-600',
        })));
      },
      error: (err) => console.error(err),
    });
  }

  viewCandidate(id: string): void {
    this._Router.navigate(['/candidate-details', id]);
  }
}