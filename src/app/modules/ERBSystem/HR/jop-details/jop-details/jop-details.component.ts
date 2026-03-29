import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HiringMember {
  name: string;
  role: string;
  imageUrl: string;
  imageAlt: string;
}

export interface QuickStat {
  iconBg: string;
  iconColor: string;
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
}

export interface JobRequirement {
  id: string;
  status: 'Active' | 'Closed' | 'Draft';
  title: string;
  department: string;
  heroImageUrl: string;
  heroImageAlt: string;
  description: string;
  responsibilities: string[];
  salary: string;
  experienceLevel: string;
  employmentType: string;
  hiringManager: string;
  hiringManagerTitle: string;
  hiringTeam: HiringMember[];
  applicationCount: number;
  newApplicationsThisWeek: number;
  applicationTarget: number;
}


@Component({
  selector: 'app-jop-details',
  imports: [CommonModule],
  templateUrl: './jop-details.component.html',
  styleUrl: './jop-details.component.scss',
})
export class JopDetailsComponent {

  isDarkMode = false;

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'work', label: 'Requirements', active: true },
    { icon: 'group', label: 'Candidates', active: false },
    { icon: 'badge', label: 'Employees', active: false },
    { icon: 'analytics', label: 'Reports', active: false },
  ];

  job: JobRequirement = {
    id: 'REQ-2023-042',
    status: 'Active',
    title: 'Senior Frontend Engineer',
    department: 'Product Engineering',
    heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0Q8SGp4KXZWXD9R3eT-nqzNJk2Gp8zwxd9FDsmFvWi1LKciT_zw0RXqNSTqLD67dPu2pPVg-_AaZadpBsKWChXTccswOJf4ShxUq-aQFnnym7zVb97ejXm5rWttCIcZfOEh9Y9Lq_PmUTDt3dbMfA6sW8qFyrZXPWAwWd3BeyCII1vnLhhyhA1fx2bhiwfQTt0nk6Lx558X0FDdCOzWQsFWGJ5wOSc3dLPn2pQxABapLERRdriZG1h6pG6K4TmhhPNMrb0m1PCtAI',
    heroImageAlt: 'Abstract modern technology workspace background',
    description: 'We are looking for a Senior Frontend Engineer to lead our core UI initiatives. You will be responsible for architecting scalable frontend systems and mentoring junior developers.',
    responsibilities: [
      'Develop high-quality, maintainable features using React and Tailwind CSS.',
      'Collaborate with product managers and designers to define technical specifications.',
      'Optimize web applications for maximum speed and scalability.',
      'Maintain and expand our internal UI component library.',
    ],
    salary: '$120,000 - $165,000 USD',
    experienceLevel: 'Senior (5+ Years)',
    employmentType: 'Full-Time',
    hiringManager: 'Sarah Jenkins',
    hiringManagerTitle: 'Director of Engineering',
    hiringTeam: [
      {
        name: 'Sarah Jenkins',
        role: 'Hiring Manager',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvIOq0-m7gWLCKXHChqnZEiSciJqJSorBW8H7Ss2n089cPqD24icONTWf9jPp7sgna7f_g9ClOJ0gCdl6XFbf-qcg7VgsZOG5sE2h2qOuPk8ahOyLQ62RsMLnW-mxN-PlWy0hUWJeu9itF7ikXIq9qQBSXTWGjRG-jQnc2IS8cwXS8Mx92D9ZYmZOW1X4FJndCL9VDyvXH4h5Azv3zsV2ZcbRUmDaMFr_xCLLlbC2UBexYWWTrATyxDoquJ-ThxpZEm-yo4s4zpC5d',
        imageAlt: 'Female hiring manager portrait',
      },
      {
        name: 'David Chen',
        role: 'Recruiter',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWeHC653mK8Z-cpgoQh12v43Hgh2QE2MlxLCy28FnuIbGJczUUUOMs5YC-SaOThHqJLfyla2940tRLn1TKcM303rAMbgygBXr7GSzc3uGJ_KCCduRLfRBBatq8Fs9hEcqasGTWF-uR9_8dyzE5IlOaiVPZFyjn6TCaORvi9q6bmyM3uS6fn1Uk6crmzY5Ftn1H4c8JFsRlQPD3o4YWB1OaAXXwecOSQnl0qaGePzY_GjEl4woTZjfcyVmbl0H-K-0pS5Orw5WIb6cN',
        imageAlt: 'Male HR recruiter portrait',
      },
    ],
    applicationCount: 48,
    newApplicationsThisWeek: 12,
    applicationTarget: 64,
  };

  quickStats: QuickStat[] = [
    {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      icon: 'payments',
      label: 'Salary Range',
      value: this.job.salary,
    },
    {
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      icon: 'verified',
      label: 'Experience Level',
      value: this.job.experienceLevel,
    },
    {
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      icon: 'person',
      label: 'Hiring Manager',
      value: this.job.hiringManager,
      subtitle: this.job.hiringManagerTitle,
    },
    {
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      icon: 'schedule',
      label: 'Employment Type',
      value: this.job.employmentType,
    },
  ];

  get applicationProgressPercent(): number {
    return Math.round((this.job.applicationCount / this.job.applicationTarget) * 100);
  }

  get statusClasses(): string {
    const map: Record<string, string> = {
      Active: 'bg-green-100 text-green-700',
      Closed: 'bg-red-100 text-red-700',
      Draft: 'bg-yellow-100 text-yellow-700',
    };
    return map[this.job.status] ?? 'bg-slate-100 text-slate-700';
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

}
