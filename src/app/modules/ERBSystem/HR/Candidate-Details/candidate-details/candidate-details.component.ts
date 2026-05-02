import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CandidateService } from '../../../../../core/services/candidate/candidate.service';


export interface InfoField {
  icon: string;
  label: string;
  value: string;
  spanFull?: boolean;
}

export interface QuickAction {
  icon: string;
  label: string;
}

export interface Candidate {
  name: string;
  jobTitle: string;
  experience: string;
  appliedAgo: string;
  isOnline: boolean;
  resumeFileName: string;
  infoFields: InfoField[];
  currency: string;
  salary: string;
}

@Component({
  selector: 'app-candidate-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './candidate-details.component.html',
  styleUrl: './candidate-details.component.scss',
})
export class CandidateDetailsComponent implements OnInit {

  private readonly _Route = inject(ActivatedRoute);
  private readonly _CandidateService = inject(CandidateService);

  isLoading = signal(true);

  navLinks = [
    { label: 'Candidates', active: false },
    { label: 'Jobs', active: false },
    { label: 'Interviews', active: false },
    { label: 'Analytics', active: false },
  ];

  breadcrumbs = [
    { label: 'Recruitment', link: '/requierments-management' },
    { label: 'Candidates', link: '/Candidate-Management' },
    { label: 'Candidate Profile', link: null },
  ];

  candidate: Candidate = {
    name: '',
    jobTitle: '',
    experience: '',
    appliedAgo: '—',
    isOnline: false,
    resumeFileName: '',
    infoFields: [],
    currency: '',
    salary: '',
  };

  quickActions: QuickAction[] = [
    { icon: 'call', label: 'Call Now' },
    { icon: 'mail', label: 'Send Email' },
    { icon: 'calendar_month', label: 'Schedule' },
  ];



  ngOnInit(): void {
    const id = this._Route.snapshot.paramMap.get('id');
    if (!id) return;

    this._CandidateService.getCandidateById(id).subscribe({
      next: (c) => {
        this.candidate = {
          name: c.fullName,
          jobTitle: c.jobTitle,
          experience: `${c.experienceInYears} Years`,
          appliedAgo: '—',
          isOnline: false,
          resumeFileName: c.resumeUrl ? c.resumeUrl.split('/').pop() ?? 'Resume.pdf' : 'No Resume',
          infoFields: [
            { icon: 'mail', label: 'Email Address', value: c.email },
            { icon: 'call', label: 'Phone Number', value: c.phone },
            { icon: 'work', label: 'Job Title', value: c.jobTitle },
            { icon: 'history_edu', label: 'Total Experience', value: `${c.experienceInYears} Years` },
            { icon: 'location_on', label: 'Current Address', value: `${c.city}, ${c.country}`, spanFull: true },
          ],
          currency: c.expectedSalaryCurrency,
          salary: `${c.expectedSalaryAmount.toLocaleString()} ${c.expectedSalaryCurrency}`,
        };
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }
}