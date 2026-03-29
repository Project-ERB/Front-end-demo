import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './candidate-details.component.html',
  styleUrl: './candidate-details.component.scss',
})
export class CandidateDetailsComponent {

  navLinks = [
    { label: 'Candidates', active: false },
    { label: 'Jobs', active: false },
    { label: 'Interviews', active: false },
    { label: 'Analytics', active: false },
  ];

  breadcrumbs = [
    { label: 'Recruitment', link: '#' },
    { label: 'Candidates', link: '#' },
    { label: 'Candidate Profile', link: null },
  ];

  candidate: Candidate = {
    name: 'Alexander Thompson',
    jobTitle: 'Senior UX Designer',
    experience: '8.5 Years',
    appliedAgo: '2 Days Ago',
    isOnline: true,
    resumeFileName: 'Resume_Alexander_T.pdf',
    infoFields: [
      { icon: 'mail', label: 'Email Address', value: 'a.thompson.designer@gmail.com' },
      { icon: 'call', label: 'Phone Number', value: '+1 (555) 012-3456' },
      { icon: 'work', label: 'Job Title', value: 'Senior UX/UI Designer' },
      { icon: 'history_edu', label: 'Total Experience', value: '8 Years, 6 Months' },
      { icon: 'location_on', label: 'Current Address', value: '742 Evergreen Terrace, Suite 10, Los Angeles, CA 90210, USA', spanFull: true },
    ],
    currency: 'USD ($)',
    salary: '$125,000',
  };

  quickActions: QuickAction[] = [
    { icon: 'call', label: 'Call Now' },
    { icon: 'mail', label: 'Send Email' },
    { icon: 'calendar_month', label: 'Schedule' },
  ];

  headerActions = [
    { icon: 'edit', label: 'Edit', primary: false },
    { icon: 'chat', label: 'Contact', primary: false },
    { icon: 'delete', label: 'Delete', primary: true },
  ];

}
