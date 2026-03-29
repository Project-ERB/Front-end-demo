import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Probation' | 'Terminated';

export interface Employee {
  id: number;
  name: string;
  email: string;
  avatar: string;
  department: string;
  level: string;
  status: EmployeeStatus;
}

interface StatCard {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  iconBg: string;
  iconColor: string;
}

interface NavItem {
  icon: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-employee-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.scss',
})
export class EmployeeManagementComponent {
  searchQuery = '';
  selectedDepartment = '';
  selectedStatus = '';

  currentPage = 1;
  pageSize = 10;
  totalEmployees = 254;

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Employees', active: true },
    { icon: 'payments', label: 'Payroll', active: false },
    { icon: 'event_available', label: 'Attendance', active: false },
    { icon: 'monitoring', label: 'Performance', active: false },
  ];

  departments = ['Engineering', 'Design', 'Marketing', 'Sales'];
  statuses: EmployeeStatus[] = ['Active', 'On Leave', 'Probation', 'Terminated'];

  allEmployees: Employee[] = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      email: 'sarah.j@company.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-SjyB0p0sNPSg48NJVKnZZVfR-trbi7IPerOWcDuT5Ii1bs_3Ws5LM9vAqdqudFryBw8OOf1ecJnj4qcVsgnSQhR7QlZugeHmZzbFd2OaE6FZkxDJW_0m4SJ__Uh9OW4ETJKGf2dzjdGk2Datp8DW2RxWJ7tXcc9rMa17vVY-78A_EGW93R63vbCHyQklOEZ8ha5TwpaZ_P4b4LldMJ5C3Gz4ndzWSJjP0fNaqBerZSTcH_8UXFz9PIo2xX_uwKEMijfVZWNUtZjX',
      department: 'Engineering',
      level: 'Senior Lead',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Marcus Thompson',
      email: 'm.thompson@company.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwwlnteZT-0e2l1-cKKDKcUYDQkYnrxeAMoKdW_pquOFTqksy92Q17yBbHWkrGK8WJZd5i2V9U5D-DSyy-Ep55U_wGL6mGjyUBq9y1_2SbYUBlAdhgHUb1jgSMMjTCUeKfzEN5vDOwB7c1zBm4hX_51d2yCKM2aZmaqS61VANc8wDTNqCR6T2Nc9YOP4O7Us8PbTHSaJDIuOmdcUlL6jIv83oZ57FAUPvBE_7cExt_DgtvAsurexCy4gmmqCtfSRu4jwVw_gZzZMJ2',
      department: 'Marketing',
      level: 'Junior Manager',
      status: 'On Leave',
    },
    {
      id: 3,
      name: 'Lila Vance',
      email: 'lila.vance@company.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARKtLXTrqKDfrATgil-L4RBdYDd3xBwv3gGBNw3LAMBeIFLyB8v7pkkCoc5VDD-enT43x9RVkRTVQ2v8x97YGEslSa_gHTogsrUSDyi5_YKTOf3T8MeV--P8Sm06saDRsBJQLd_q2ih0V3mk2YMDo_sc6mnvTLNw8n0iBYrb5Lwi2Yd2OirP3TSiOjrRQqnl4kauatOZm69_9hNTqQy1cBhZBMDXejaZzNezf4um88SGn5iSXMd2hT0awsmDbZTELpJlk8uYxKD39N',
      department: 'Design',
      level: 'Principal Designer',
      status: 'Active',
    },
    {
      id: 4,
      name: 'David Chen',
      email: 'd.chen@company.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfCmx04Q17l6hXIDEgNafLatRnO_lIN5EzC7htyDnPLlB_XFCdn7SxjlSQffaK_s16UwB5IbmJMW6I5xsMbow7rQ7zQmiy8_6Z62C49bram4nx4w2PkKxON_-r8XxxZo_P2X9mZWI-zYKg9GLOHrVLSxTGthkXDVuZG2-4AT1JnsRGkuglg-43o5MSt0ge096O3LnWv1rusAFVeNnM8JoEElryd1ztR8OyUC-oONbpBF0Hcd5a6IBcz_4F6CW1N84PKRXo9mVYzrhX',
      department: 'Engineering',
      level: 'Backend Dev',
      status: 'Probation',
    },
  ];

  statCards: StatCard[] = [
    {
      icon: 'person_add',
      label: 'New Hires',
      value: '12',
      sub: '+4% this month',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
    },
    {
      icon: 'diversity_3',
      label: 'Retention Rate',
      value: '98.2%',
      iconBg: 'bg-[#ec5b13]/10',
      iconColor: 'text-[#ec5b13]',
    },
    {
      icon: 'hourglass_empty',
      label: 'Open Positions',
      value: '8',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
    },
  ];

  // ── Derived ──────────────────────────────────────────

  get filteredEmployees(): Employee[] {
    const q = this.searchQuery.toLowerCase();
    return this.allEmployees.filter((e) => {
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q);
      const matchesDept =
        !this.selectedDepartment || e.department === this.selectedDepartment;
      const matchesStatus =
        !this.selectedStatus || e.status === this.selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalEmployees / this.pageSize);
  }

  /** Pages to show in pagination widget (max 3 visible + last) */
  get visiblePages(): number[] {
    return [1, 2, 3];
  }

  get showingFrom(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalEmployees);
  }

  // ── Methods ──────────────────────────────────────────

  ngOnInit(): void { }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onView(emp: Employee): void {
    console.log('View:', emp);
  }

  onEdit(emp: Employee): void {
    console.log('Edit:', emp);
  }

  onDelete(emp: Employee): void {
    if (confirm(`Delete ${emp.name}?`)) {
      this.allEmployees = this.allEmployees.filter((e) => e.id !== emp.id);
    }
  }

  statusBadgeClass(status: EmployeeStatus): string {
    const map: Record<EmployeeStatus, string> = {
      Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'On Leave': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Probation: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Terminated: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status];
  }
}