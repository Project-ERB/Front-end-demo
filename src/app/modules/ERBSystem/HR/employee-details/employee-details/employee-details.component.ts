import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TabItem {
  label: string;
  active: boolean;
}

interface TimeOffBand {
  label: string;
  used: number;
  total: number;
  color: string;
}
@Component({
  selector: 'app-employee-details',
  imports: [CommonModule],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.scss',
})
export class EmployeeDetailsComponent {

  activeTab = 'Overview';

  tabs: TabItem[] = [
    { label: 'Overview', active: true },
    { label: 'Employment', active: false },
    { label: 'Documents', active: false },
    { label: 'Performance', active: false },
    { label: 'Assets', active: false },
  ];

  /** Personal information */
  personal = {
    fullName: 'Johnathan Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    birthDate: 'May 12, 1990 (34 years)',
    address: '123 Tech Lane, Apt 4B, San Francisco, CA 94105, United States',
  };

  /** Employment details */
  employment = {
    department: 'Product Engineering',
    level: 'L4 - Senior',
    type: 'Regular Full-time',
    hireDate: 'January 15, 2021 (3.4 Years)',
    managerName: 'Sarah Chen',
    managerTitle: 'VP of Engineering',
    managerImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgfrq1OChqTcZ7cmO88-kyHpc5EodvygVLrJlgxRaNfNgV7taQ88Gri-q0dlMR0L0J4Gd6TBW_1tOBixM-kDfJqgK0gx-w2HEenGxegtdBxggGWSabNBEHvcsUmDQ2bDu63NzzhVvFQBoS7L6Z98Dj7Gpm2EGCw52zkwdbvFWGAlbLsIT55RDxWEwMfe6VB_ff2A6ZiYku62QV6OgvMYRXfL48R9bDyBFX-Xw3JrSprtsGZL_w3CFvd8mznHL5d00lLg5CvcG4AXNa',
  };

  /** Financials */
  financials = {
    salary: '$145,000',
    currency: 'USD',
    bankName: 'Chase Bank **** 4291',
    bankType: 'Checking Account',
  };

  /** Time-off bands */
  timeOff: TimeOffBand[] = [
    { label: 'Paid Time Off (PTO)', used: 12, total: 20, color: 'bg-[#ec5b13]' },
    { label: 'Sick Leave', used: 8, total: 10, color: 'bg-blue-500' },
  ];

  bandPercent(band: TimeOffBand): number {
    return Math.round((band.used / band.total) * 100);
  }

  selectTab(label: string): void {
    this.activeTab = label;
    this.tabs = this.tabs.map(t => ({ ...t, active: t.label === label }));
  }
}
