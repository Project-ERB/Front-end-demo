import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type CandidateStatus = 'Hired' | 'Interviewing' | 'New' | 'Rejected';

export interface Candidate {
  id: number;
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
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-management.component.html',
  styleUrl: './candidate-management.component.scss',
})
export class CandidateManagementComponent {

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
  allCandidates: Candidate[] = [
    { id: 1, initials: 'JD', initialsColor: 'bg-blue-100 text-blue-600', name: 'John Doe', jobTitle: 'Senior Software Engineer', expYears: 8, email: 'john.doe@example.com', status: 'Hired' },
    { id: 2, initials: 'JS', initialsColor: 'bg-orange-100 text-orange-600', name: 'Jane Smith', jobTitle: 'Product Designer', expYears: 4, email: 'jane.smith@design.co', status: 'Interviewing' },
    { id: 3, initials: 'RB', initialsColor: 'bg-slate-100 text-slate-600', name: 'Robert Brown', jobTitle: 'QA Engineer', expYears: 2, email: 'robert.b@testit.io', status: 'New' },
    { id: 4, initials: 'ED', initialsColor: 'bg-red-100 text-red-600', name: 'Emily Davis', jobTitle: 'Marketing Manager', expYears: 6, email: 'emily.d@brand.com', status: 'Rejected' },
    { id: 5, initials: 'MW', initialsColor: 'bg-purple-100 text-purple-600', name: 'Michael Wilson', jobTitle: 'Data Analyst', expYears: 3, email: 'm.wilson@data.net', status: 'New' },
    { id: 6, initials: 'AL', initialsColor: 'bg-teal-100 text-teal-600', name: 'Alice Lee', jobTitle: 'DevOps Engineer', expYears: 5, email: 'alice.lee@infra.io', status: 'Interviewing' },
    { id: 7, initials: 'TK', initialsColor: 'bg-green-100 text-green-600', name: 'Tom King', jobTitle: 'Backend Developer', expYears: 7, email: 'tom.k@server.dev', status: 'New' },
    { id: 8, initials: 'SP', initialsColor: 'bg-pink-100 text-pink-600', name: 'Sara Park', jobTitle: 'UX Researcher', expYears: 3, email: 'sara.p@ux.co', status: 'Hired' },
    { id: 9, initials: 'CN', initialsColor: 'bg-yellow-100 text-yellow-600', name: 'Carlos Nava', jobTitle: 'Mobile Developer', expYears: 4, email: 'c.nava@mobile.io', status: 'New' },
    { id: 10, initials: 'LW', initialsColor: 'bg-indigo-100 text-indigo-600', name: 'Laura White', jobTitle: 'Scrum Master', expYears: 6, email: 'l.white@agile.com', status: 'Interviewing' },
    { id: 11, initials: 'BJ', initialsColor: 'bg-rose-100 text-rose-600', name: 'Ben Johnson', jobTitle: 'Security Analyst', expYears: 9, email: 'b.johnson@sec.io', status: 'New' },
    { id: 12, initials: 'NA', initialsColor: 'bg-cyan-100 text-cyan-600', name: 'Nina Adams', jobTitle: 'Cloud Architect', expYears: 11, email: 'n.adams@cloud.net', status: 'Hired' },
  ];

  // ── Derived ────────────────────────────────────────────────────────────────
  filteredCandidates = computed(() => {
    const tab = this.activeTab();
    const text = this.filterText().toLowerCase();

    const tabFiltered = tab === 'All Candidates'
      ? this.allCandidates
      : this.allCandidates.filter(c => {
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

}
