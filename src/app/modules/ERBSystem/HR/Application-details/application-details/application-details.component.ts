import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StageStatus = 'completed' | 'active' | 'pending';

export interface TimelineStage {
  id: number;
  title: string;
  description: string;
  date?: string;
  status: StageStatus;
  icon: string;
  actions?: { label: string; href?: string }[];
  activeLabel?: string;
}

export interface JobDetail {
  title: string;
  team: string;
  type: string;
  hiringManager: string;
  department: string;
  budgetRange: string;
}

export interface CandidateAsset {
  icon: string;
  iconColor: string;
  name: string;
  meta: string;
  actionIcon: string;
  href: string;
}

@Component({
  selector: 'app-application-details',
  imports: [CommonModule],
  templateUrl: './application-details.component.html',
  styleUrl: './application-details.component.scss',
})
export class ApplicationDetailsComponent {

  candidate = {
    name: 'John Doe',
    role: 'Senior Product Designer',
    ref: '#JD-992',
    status: 'Active',
    appliedOn: 'Oct 12, 2023',
    email: 'john.doe@example.com',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCMjTGX5LsJt9u1YcURYiRLy-c0-y7jGuqJcf_mJ3GuC5c9qWLrQfaLm2AdfzDHBw1ziwTiFqqAL49mow8Iunr8m1mHgWNc-lFzIn2_bpxwZAdFdJp1L3HOlKRZxQqFDdsCBqmUJQswxxjRKq3JOqpM8kqxhUnmtJEf2iD-Jc449i5vn08C9eKFzF2X0SEG4NSvFMUQbWs-uEXNQQssKHe0WqJAuYRpdTU-VeeC62BsXTFGHrfo6CReQrk4-Cyzrzya-wxX9mB5eRTF',
    online: true,
  };

  currentStageLabel = 'Technical Assessment';

  timeline: TimelineStage[] = [
    {
      id: 4,
      title: 'Technical Assessment',
      description: 'Assignment sent on Oct 24. Candidate is working on the design challenge.',
      status: 'active',
      icon: 'assignment',
      activeLabel: 'IN PROGRESS',
      actions: [
        { label: 'View Challenge' },
        { label: 'Send Reminder' },
      ],
    },
    {
      id: 3,
      title: 'Portfolio Review',
      description: 'Reviewed by Design Lead Sarah Jenkins. High performance in mobile interaction design.',
      date: 'Oct 20, 2023',
      status: 'completed',
      icon: 'check',
    },
    {
      id: 2,
      title: 'Initial Screening',
      description: 'HR phone call completed. Cultural fit confirmed.',
      date: 'Oct 15, 2023',
      status: 'completed',
      icon: 'check',
    },
    {
      id: 1,
      title: 'Application Received',
      description: 'Candidate submitted application via LinkedIn portal.',
      date: 'Oct 12, 2023',
      status: 'completed',
      icon: 'check',
    },
  ];

  jobDetail: JobDetail = {
    title: 'Senior Product Designer',
    team: 'Design Team',
    type: 'Full-time',
    hiringManager: 'Sarah Jenkins',
    department: 'Product & UX',
    budgetRange: '$120k - $160k',
  };

  assets: CandidateAsset[] = [
    {
      icon: 'picture_as_pdf',
      iconColor: 'text-red-500',
      name: 'Resume_John_Doe.pdf',
      meta: '2.4 MB • Updated Oct 12',
      actionIcon: 'download',
      href: '#',
    },
    {
      icon: 'link',
      iconColor: 'text-blue-500',
      name: 'Portfolio Website',
      meta: 'johndoe.design',
      actionIcon: 'open_in_new',
      href: '#',
    },
  ];

  internalNote = {
    text: '"Candidate has exceptional Figma skills and experience leading design systems. Highly recommended for the Design Systems track."',
    author: 'Sarah Jenkins',
    timeAgo: '2 days ago',
  };

  onReject(): void {
    console.log('Reject candidate:', this.candidate.name);
  }

  onScheduleInterview(): void {
    console.log('Schedule interview for:', this.candidate.name);
  }

  onViewJobDescription(): void {
    console.log('View job description');
  }

  onEditNote(): void {
    console.log('Edit internal note');
  }

  onStageAction(action: { label: string; href?: string }): void {
    console.log('Stage action:', action.label);
  }

}
