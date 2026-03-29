import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ExperienceLevel = 'Junior' | 'Mid-Level' | 'Senior';

export interface HiringManager {
  initials: string;
  name: string;
  avatarColor: string; // Tailwind bg + text classes
}

export interface JobRequirement {
  id: number;
  title: string;
  description: string;
  department: string;
  manager: HiringManager;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  experienceLevel: ExperienceLevel;
}

@Component({
  selector: 'app-jop-management',
  imports: [CommonModule],
  templateUrl: './jop-management.component.html',
  styleUrl: './jop-management.component.scss',
})
export class JopManagementComponent {

  searchQuery = signal('');

  currentPage = signal(1);
  readonly pageSize = 4;
  readonly totalRecords = 24;
  readonly pages = [1, 2, 3, 6];

  readonly allRequirements: JobRequirement[] = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      description: 'Specialized in React, Tailwind and modern UI patterns.',
      department: 'Engineering',
      manager: { initials: 'JD', name: 'Jane Doe', avatarColor: 'bg-orange-100 text-[#ec5b13]' },
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
      manager: { initials: 'MR', name: 'Marcus Reed', avatarColor: 'bg-blue-100 text-blue-600' },
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
      manager: { initials: 'SL', name: 'Sarah Lee', avatarColor: 'bg-purple-100 text-purple-600' },
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
      manager: { initials: 'TK', name: 'Tom Klein', avatarColor: 'bg-slate-200 text-slate-600' },
      salaryMin: 140000,
      salaryMax: 190000,
      currency: 'USD',
      experienceLevel: 'Senior',
    },
  ];

  filteredRequirements = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.allRequirements;
    return this.allRequirements.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.manager.name.toLowerCase().includes(q)
    );
  });

  get showingText(): string {
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, this.totalRecords);
    return `Showing ${start}-${end} of ${this.totalRecords} requirements`;
  }

  experienceBadgeClass(level: ExperienceLevel): string {
    switch (level) {
      case 'Senior':
        return 'bg-orange-100 text-orange-700';
      case 'Mid-Level':
        return 'bg-blue-100 text-blue-700';
      case 'Junior':
        return 'bg-green-100 text-green-700';
    }
  }

  formatSalary(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  setPage(page: number): void {
    this.currentPage.set(page);
  }

  onAddNew(): void {
    console.log('Add new requirement');
  }

  onView(req: JobRequirement): void {
    console.log('View', req.title);
  }

  onEditSalary(req: JobRequirement): void {
    console.log('Edit salary for', req.title);
  }

  onDelete(req: JobRequirement): void {
    console.log('Delete', req.title);
  }

}
