import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type OfferStatus = 'Accepted' | 'Sent' | 'Draft' | 'Rejected';

export interface Offer {
  id: number;
  initials: string;
  candidateName: string;
  interviewDate: string;
  jobTitle: string;
  workType: string;
  location: string;
  salary: string;
  currency: string;
  expiration: string;
  status: OfferStatus;
  isActive: boolean;
}

@Component({
  selector: 'app-offer-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './offer-management.component.html',
  styleUrl: './offer-management.component.scss',
})
export class OfferManagementComponent {

  searchQuery = '';
  selectedPeriod = 'Last 30 Days';
  activeFilter: OfferStatus | 'All Status' = 'All Status';

  periods = ['Last 30 Days', 'Last 6 Months', 'Year to Date'];
  statusFilters: (OfferStatus | 'All Status')[] = [
    'All Status',
    'Draft',
    'Sent',
    'Accepted',
    'Rejected',
  ];

  stats = [
    {
      label: 'Total Offers',
      value: '1,284',
      trend: '+12%',
      trendUp: true,
      icon: 'description',
      colorClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'Accepted',
      value: '856',
      trend: '+5%',
      trendUp: true,
      icon: 'check_circle',
      colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
    },
    {
      label: 'Pending',
      value: '142',
      trend: '-2%',
      trendUp: false,
      icon: 'schedule',
      colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
    },
    {
      label: 'Conv. Rate',
      value: '67.4%',
      trend: '+3.1%',
      trendUp: true,
      icon: 'query_stats',
      colorClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30',
    },
  ];

  allOffers: Offer[] = [
    {
      id: 1,
      initials: 'AM',
      candidateName: 'Alex Morgan',
      interviewDate: 'Oct 12',
      jobTitle: 'Senior Product Designer',
      workType: 'Full-time',
      location: 'Remote',
      salary: '$145,000',
      currency: 'USD',
      expiration: 'Oct 28, 2024',
      status: 'Accepted',
      isActive: true,
    },
    {
      id: 2,
      initials: 'BT',
      candidateName: 'Bethany Tims',
      interviewDate: 'Oct 15',
      jobTitle: 'Software Engineer II',
      workType: 'Full-time',
      location: 'New York',
      salary: '$120,000',
      currency: 'USD',
      expiration: 'Nov 02, 2024',
      status: 'Sent',
      isActive: true,
    },
    {
      id: 3,
      initials: 'RK',
      candidateName: 'Ryan Kostic',
      interviewDate: 'Oct 08',
      jobTitle: 'Head of Operations',
      workType: 'Full-time',
      location: 'London',
      salary: '£110,000',
      currency: 'GBP',
      expiration: 'Oct 24, 2024',
      status: 'Draft',
      isActive: false,
    },
    {
      id: 4,
      initials: 'LM',
      candidateName: 'Lisa Miller',
      interviewDate: 'Oct 05',
      jobTitle: 'HR Manager',
      workType: 'Full-time',
      location: 'Remote',
      salary: '$95,000',
      currency: 'USD',
      expiration: 'Oct 20, 2024',
      status: 'Rejected',
      isActive: false,
    },
  ];

  get filteredOffers(): Offer[] {
    return this.allOffers.filter((offer) => {
      const matchesStatus =
        this.activeFilter === 'All Status' ||
        offer.status === this.activeFilter;
      const matchesSearch =
        !this.searchQuery ||
        offer.candidateName
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        offer.jobTitle.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  ngOnInit(): void { }

  setFilter(filter: OfferStatus | 'All Status'): void {
    this.activeFilter = filter;
  }

  toggleActive(offer: Offer): void {
    offer.isActive = !offer.isActive;
  }

  getStatusClasses(status: OfferStatus): string {
    const map: Record<OfferStatus, string> = {
      Accepted:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      Sent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
      Draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      Rejected:
        'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
    };
    return map[status];
  }

  getInitialsClasses(initials: string): string {
    return initials === 'AM'
      ? 'bg-primary/10 text-primary'
      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  }

  exportCSV(): void {
    const headers = [
      'Candidate',
      'Job Title',
      'Salary',
      'Currency',
      'Expiration',
      'Status',
      'Active',
    ];
    const rows = this.allOffers.map((o) => [
      o.candidateName,
      o.jobTitle,
      o.salary,
      o.currency,
      o.expiration,
      o.status,
      o.isActive ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'offers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

}
