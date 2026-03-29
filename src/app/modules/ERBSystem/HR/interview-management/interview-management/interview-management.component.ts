import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type FilterTab = 'All Interviews' | 'Upcoming' | 'Completed';

export interface Interview {
  id: number;
  candidate: { name: string; avatar: string };
  interviewer: string;
  date: string;
  time: string;
  location: string;
  locationIcon: 'videocam' | 'location_on';
  type: string;
  typeColor: string;
  stage: string;
  status: InterviewStatus;
}

@Component({
  selector: 'app-interview-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-management.component.html',
  styleUrl: './interview-management.component.scss',
})
export class InterviewManagementComponent {
  searchQuery = '';
  activeFilter = signal<FilterTab>('All Interviews');

  readonly filterTabs: FilterTab[] = ['All Interviews', 'Upcoming', 'Completed'];

  readonly navLinks = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'person_search', label: 'Recruitment', active: false },
    { icon: 'event_available', label: 'Interviews', active: true },
    { icon: 'group', label: 'Employees', active: false },
    { icon: 'payments', label: 'Payroll', active: false },
    { icon: 'analytics', label: 'Reports', active: false },
  ];

  readonly orgLinks = [
    { icon: 'settings', label: 'Settings' },
    { icon: 'help', label: 'Support' },
  ];

  readonly stats = [
    { label: 'Interviews Today', icon: 'today', value: '12', sub: '+2 from yesterday', subColor: 'text-emerald-500' },
    { label: 'Pending Feedback', icon: 'rate_review', value: '5', sub: 'Requires attention', subColor: 'text-amber-500' },
    { label: 'Avg. Completion Rate', icon: 'query_stats', value: '94%', sub: 'Last 30 days', subColor: 'text-slate-400' },
  ];

  readonly allInterviews: Interview[] = [
    {
      id: 1,
      candidate: {
        name: 'Sarah Jenkins',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYsq8GOTvdmSemPFi7KMCDWeUakdicUDuxDpQd9cWiQk6gNxrUzmbOENVmCnbQW_UsmybALqCJrmnYSFDv-snsSKWWIjs_Rl0ZeT8HTW_T9D6aeSSCJkjijDvBSBw-atgLUrjXgVvpD7tjbCo2gua7aB3M-WOmRUyuKIPeSWV86Gem-bGmY9uTGhLcVGiNqwTpd5Aq4VI_P_02-Hdv1GXnIsKz7RxlZiPjk5mQcz4kiqCz4yZXrEj-NYWJ3zBjZH0eyvJVvg5gFURx',
      },
      interviewer: 'Mark Wood',
      date: 'Oct 24, 2023',
      time: '10:00 AM - 11:30 AM',
      location: 'Remote (Zoom)',
      locationIcon: 'videocam',
      type: 'Technical',
      typeColor: 'bg-blue-100 text-blue-700',
      stage: 'Second Round',
      status: 'Scheduled',
    },
    {
      id: 2,
      candidate: {
        name: 'James Wilson',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdtUWtfZ7miim4X_Li4vAKN6_SMDlBLh_wfvMZJfezkrTxinCbA69aWAdM0ur11LcbTd-_X2MVVVWI7PYtST_c25kQqh2FtXvTQOmLMo50P4h81RNGvi_m0OeRM0Aj6q4FxndZHQ_1rNrOUdeFQ0rrfC-wFEfk8enopeRm5NGy1j_aHGiqtJN0CVUaZzrABhIngEJNlflDaKp0Fo-F2yVHTnh30Nc0-i46yMb1OxTqjIDm4_iSZc0IXinLmEeG6dylTNmpEK07u_hA',
      },
      interviewer: 'Sarah Rivera',
      date: 'Oct 24, 2023',
      time: '02:00 PM - 03:00 PM',
      location: 'Meeting Room A',
      locationIcon: 'location_on',
      type: 'Behavioral',
      typeColor: 'bg-purple-100 text-purple-700',
      stage: 'Initial Screen',
      status: 'Completed',
    },
    {
      id: 3,
      candidate: {
        name: 'Emily Chen',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSKQbGKTajpr3buI8M0o8hLCTQKJfzgZw0nknO6SfMY5KiuAJ54sgMTQE6R4thx6f5zMip5-3DcaV9rcjm3HXyufqd0g42oRqSKCjMMcDJSRakAeGCpG7bgznHOCiSiCqHWZQA0XadAFARB0cQu9RCO2zkFCvDzSuaHotckA-RAFawkkkjRfz4ZpZIE_ktbgsyPDh6r0dUvy-CLezgYCvifHO2uPy2LYgBydSW7jlX3lP4bV0dgM1SVpTSPfVeELX6vLaFa_HVTUrF',
      },
      interviewer: 'Mark Wood',
      date: 'Oct 25, 2023',
      time: '09:00 AM - 10:30 AM',
      location: 'Remote (Teams)',
      locationIcon: 'videocam',
      type: 'Technical',
      typeColor: 'bg-blue-100 text-blue-700',
      stage: 'System Design',
      status: 'Cancelled',
    },
    {
      id: 4,
      candidate: {
        name: 'Michael Scott',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBelf2h_Ablk7NuoEvGLzTF7xh0sTZDuQlAFDQMLgEHtriHCO8Qs06d1lVSO_8AuVERVucf_pVQKPztJzJPjPpmCSeidTywKlUeSF6kfkyUjXA7aVo_63zdD8s9llbeyuguP__Xi8yq7ulnHKcvH0C3AGq4ROtluIv4L1LFVy1HqgLEWialAajMwZhJp2VjUCtoasLPqL8vTTywo-OgrY3cYqZllRebh5jDriCpRT2ZxskQ_XlJLguvametQgJKRixr_uaiKXwnJBme',
      },
      interviewer: 'Dwight Schrute',
      date: 'Oct 26, 2023',
      time: '11:00 AM - 12:00 PM',
      location: 'Conference Room 2',
      locationIcon: 'location_on',
      type: 'Cultural Fit',
      typeColor: 'bg-orange-100 text-orange-700',
      stage: 'Final Round',
      status: 'Scheduled',
    },
  ];

  // Pagination
  currentPage = signal(1);
  readonly pageSize = 4;
  readonly totalEntries = 24;

  readonly totalPages = computed(() => Math.ceil(this.totalEntries / this.pageSize));

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  filteredInterviews = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'Upcoming') return this.allInterviews.filter(i => i.status === 'Scheduled');
    if (filter === 'Completed') return this.allInterviews.filter(i => i.status === 'Completed');
    return this.allInterviews;
  });

  setFilter(tab: FilterTab): void {
    this.activeFilter.set(tab);
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  lastEntryOnPage(): number {
    return Math.min(this.currentPage() * this.pageSize, this.totalEntries);
  }

  statusConfig(status: InterviewStatus): { dot: string; text: string; extra: string } {
    switch (status) {
      case 'Scheduled':
        return { dot: 'bg-amber-500', text: 'text-amber-600', extra: '' };
      case 'Completed':
        return { dot: 'bg-emerald-500', text: 'text-emerald-600', extra: '' };
      case 'Cancelled':
        return { dot: 'bg-slate-400', text: 'text-slate-400', extra: 'line-through' };
    }
  }
}
