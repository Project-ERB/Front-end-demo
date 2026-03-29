import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Application {
  id: number;
  initials: string;
  avatarColor: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  startDate: string;
  stage: 'Initial Screen' | 'Interview' | 'Offer' | 'Assessment';
  stageColor: 'blue' | 'slate' | 'indigo' | 'violet';
  status: 'Pending' | 'Accepted' | 'Rejected';
}

@Component({
  selector: 'app-application-management',
  imports: [CommonModule],
  templateUrl: './application-management.component.html',
  styleUrl: './application-management.component.scss',
})
export class ApplicationManagementComponent {

  activeFilter = 'all';

  filters = [
    { key: 'all', label: 'All Apps', count: 124 },
    { key: 'screening', label: 'Screening', count: 42 },
    { key: 'interviews', label: 'Interviews', count: 18 },
    { key: 'offers', label: 'Offers', count: 5 },
  ];

  applications: Application[] = [
    {
      id: 1,
      initials: 'JD',
      avatarColor: 'blue',
      name: 'Johnathan Doe',
      email: 'j.doe@example.com',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering Department',
      startDate: 'Oct 12, 2023',
      stage: 'Interview',
      stageColor: 'blue',
      status: 'Pending',
    },
    {
      id: 2,
      initials: 'AS',
      avatarColor: 'purple',
      name: 'Alice Smith',
      email: 'alice.s@cloudnet.io',
      jobTitle: 'Product Manager',
      department: 'Product Team',
      startDate: 'Oct 14, 2023',
      stage: 'Initial Screen',
      stageColor: 'slate',
      status: 'Accepted',
    },
    {
      id: 3,
      initials: 'RB',
      avatarColor: 'orange',
      name: 'Robert Brown',
      email: 'robert.b@design.com',
      jobTitle: 'UX Designer',
      department: 'Design Studio',
      startDate: 'Sep 28, 2023',
      stage: 'Offer',
      stageColor: 'indigo',
      status: 'Pending',
    },
    {
      id: 4,
      initials: 'MW',
      avatarColor: 'rose',
      name: 'Alice White',
      email: 'awhite@analytics.net',
      jobTitle: 'Data Analyst',
      department: 'Business Intelligence',
      startDate: 'Oct 05, 2023',
      stage: 'Initial Screen',
      stageColor: 'slate',
      status: 'Rejected',
    },
  ];

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  getFilterLabel(key: string): string {
    return this.filters.find(f => f.key === key)?.label ?? '';
  }

  getFilterCount(key: string): number {
    return this.filters.find(f => f.key === key)?.count ?? 0;
  }

  getAvatarClasses(color: string): string {
    const map: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      rose: 'bg-rose-100 text-rose-700',
    };
    return map[color] ?? 'bg-slate-100 text-slate-700';
  }

  getStageClasses(color: string): string {
    const map: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-700',
      slate: 'bg-slate-100 text-slate-700',
      indigo: 'bg-indigo-50 text-indigo-700',
      violet: 'bg-violet-50 text-violet-700',
    };
    return map[color] ?? 'bg-slate-100 text-slate-700';
  }

  getStageDotClasses(color: string): string {
    const map: Record<string, string> = {
      blue: 'bg-blue-500',
      slate: 'bg-slate-400',
      indigo: 'bg-indigo-500',
      violet: 'bg-violet-500',
    };
    return map[color] ?? 'bg-slate-400';
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-amber-50 text-amber-700',
      Accepted: 'bg-emerald-50 text-emerald-700',
      Rejected: 'bg-rose-50 text-rose-700',
    };
    return map[status] ?? 'bg-slate-100 text-slate-700';
  }

  onView(app: Application): void {
    console.log('Viewing application:', app.name);
  }

  onAccept(app: Application): void {
    console.log('Accepting application:', app.name);
  }

  onReject(app: Application): void {
    console.log('Rejecting application:', app.name);
  }

}
