import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";

export interface JobRequirement {
  id: number;
  title: string;
  description: string;
  department: string;
  hiringManager: { initials: string; name: string; colorClass: string };
  salaryMin: number;
  salaryMax: number;
  currency: string;
  experienceLevel: 'Junior' | 'Mid-Level' | 'Senior';
}

@Component({
  selector: 'app-jop-management',
  imports: [CommonModule, FormsModule, HrSidebarComponent],
  templateUrl: './jop-management.component.html',
  styleUrl: './jop-management.component.scss',
})
export class JopManagementComponent {

  private readonly _Router = inject(Router);

  searchQuery = '';

  allRequirements: JobRequirement[] = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      description: 'Specialized in React, Tailwind and modern UI patterns.',
      department: 'Engineering',
      hiringManager: { initials: 'JD', name: 'Jane Doe', colorClass: 'bg-primary/10 text-primary' },
      salaryMin: 120000,
      salaryMax: 165000,
      currency: 'USD',
      experienceLevel: 'Senior',
    },
    {
      id: 2,
      title: 'Product Marketing Manager',
      description: 'Driving GTM strategies for the SaaS expansion.',
      department: 'Marketing',
      hiringManager: { initials: 'MR', name: 'Marcus Reed', colorClass: 'bg-blue-100 text-blue-600' },
      salaryMin: 95000,
      salaryMax: 130000,
      currency: 'USD',
      experienceLevel: 'Mid-Level',
    },
    {
      id: 3,
      title: 'Junior UX Designer',
      description: 'Assisting the design team with wireframes and prototyping.',
      department: 'Design',
      hiringManager: { initials: 'SL', name: 'Sarah Lee', colorClass: 'bg-purple-100 text-purple-600' },
      salaryMin: 60000,
      salaryMax: 85000,
      currency: 'USD',
      experienceLevel: 'Junior',
    },
    {
      id: 4,
      title: 'DevOps Specialist',
      description: 'AWS infrastructure management and CI/CD pipelines.',
      department: 'Engineering',
      hiringManager: { initials: 'TK', name: 'Tom Klein', colorClass: 'bg-slate-200 text-slate-600' },
      salaryMin: 140000,
      salaryMax: 190000,
      currency: 'USD',
      experienceLevel: 'Senior',
    },
  ];

  // Pagination
  currentPage = 1;
  pageSize = 4;
  totalRequirements = 24;

  get totalPages(): number {
    return Math.ceil(this.totalRequirements / this.pageSize);
  }

  get pages(): number[] {
    return [1, 2, 3];
  }

  get filteredRequirements(): JobRequirement[] {
    if (!this.searchQuery.trim()) return this.allRequirements;
    const q = this.searchQuery.toLowerCase();
    return this.allRequirements.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.hiringManager.name.toLowerCase().includes(q)
    );
  }

  formatSalary(value: number): string {
    return '$' + value.toLocaleString('en-US');
  }

  experienceBadgeClass(level: JobRequirement['experienceLevel']): string {
    switch (level) {
      case 'Senior':
        return 'bg-orange-100 text-orange-700';
      case 'Mid-Level':
        return 'bg-blue-100 text-blue-700';
      case 'Junior':
        return 'bg-green-100 text-green-700';
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onView(req: JobRequirement): void {
    alert(`View: ${req.title}`);
  }

  onEditSalary(req: JobRequirement): void {
    alert(`Edit Salary: ${req.title}`);
  }

  onDelete(req: JobRequirement): void {
    if (confirm(`Delete "${req.title}"?`)) {
      this.allRequirements = this.allRequirements.filter((r) => r.id !== req.id);
    }
  }

  onAddNew(): void {
    this._Router.navigate(['/add-jop-requierments']);
  }
}
