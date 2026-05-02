import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Environment } from '../../../../../shared/UI/environment/env';
import { forkJoin, map } from 'rxjs';
import { CandidateService } from '../../../../../core/services/candidate/candidate.service';
import { JopService } from '../../../../../core/services/jop/jop.service';

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
export class ApplicationDetailsComponent implements OnInit {

  private readonly _route = inject(ActivatedRoute);
  private readonly _http = inject(HttpClient);
  private readonly _candidateService = inject(CandidateService);
  private readonly _jobService = inject(JopService);
  private readonly _Router = inject(Router);

  isLoading = signal(true);

  candidate = {
    name: '',
    role: '',
    ref: '',
    status: '',
    appliedOn: '—',
    email: '',
    avatarUrl: 'https://ui-avatars.com/api/?name=&background=e2e8f0&color=64748b',
    online: false,
  };

  currentStageLabel = '';

  timeline: TimelineStage[] = [];

  jobDetail: JobDetail = {
    title: '—',
    team: '—',
    type: '—',
    hiringManager: '—',
    department: '—',
    budgetRange: '—',
  };

  assets: CandidateAsset[] = [];

  internalNote = {
    text: 'No internal notes yet.',
    author: '—',
    timeAgo: '',
  };

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (!id) return;

    // ← جيب الـ application أولاً
    const appQuery = `
  query {
    applicationProcess(id: "${id}") {
      id
      candidateId
      recruitmentId
      currentStage
      appStatus
    }
  }
`;

    this._http
      .post<any>(`${Environment.baseUrl}/graphql`, { query: appQuery }) // ← query مش appQuery
      .pipe(map((res) => res.data.applicationProcess))
      .subscribe({
        next: (app) => {
          // ← بعدين جيب الـ candidate والـ job بالـ IDs
          forkJoin({
            candidate: this._candidateService.getCandidateById(app.candidateId),
            job: this._jobService.getRecruitmentById(app.recruitmentId),
          }).subscribe({
            next: ({ candidate, job }) => {

              this.candidate = {
                name: candidate.fullName,
                role: candidate.jobTitle,
                ref: `#${app.id.slice(0, 6).toUpperCase()}`,
                status: app.appStatus,
                appliedOn: '—',
                email: candidate.email,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.fullName)}&background=dbeafe&color=2563eb`,
                online: false,
              };

              this.currentStageLabel = app.currentStage;

              // ← بناء الـ timeline من الـ currentStage
              this.timeline = this.buildTimeline(app.currentStage);

              this.jobDetail = {
                title: job.title,
                team: '—',
                type: '—',
                hiringManager: '—',
                department: job.departmentId,
                budgetRange: `${job.minSalaryAmount?.toLocaleString()} - ${job.maxSalaryAmount?.toLocaleString()} ${job.minSalaryCurrency ?? ''}`,
              };

              this.assets = candidate.resumeUrl
                ? [{
                  icon: 'picture_as_pdf',
                  iconColor: 'text-red-500',
                  name: candidate.resumeUrl.split('/').pop() ?? 'Resume.pdf',
                  meta: 'Resume',
                  actionIcon: 'download',
                  href: candidate.resumeUrl,
                }]
                : [];

              this.isLoading.set(false);
            },
          });
        },
      });
  }

  // ← بيبني الـ timeline بناءً على الـ currentStage
  buildTimeline(currentStage: string): TimelineStage[] {
    const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
    const currentIndex = stages.indexOf(currentStage);

    return stages.map((stage, i) => ({
      id: i + 1,
      title: stage,
      description: this.stageDescription(stage),
      status: i < currentIndex ? 'completed' : i === currentIndex ? 'active' : 'pending',
      icon: i < currentIndex ? 'check' : this.stageIcon(stage),
      activeLabel: 'IN PROGRESS',
    })).reverse() as TimelineStage[];
  }

  stageIcon(stage: string): string {
    const map: Record<string, string> = {
      'Applied': 'send',
      'Screening': 'contact_phone',
      'Interview': 'groups',
      'Offer': 'description',
      'Hired': 'celebration',
    };
    return map[stage] ?? 'circle';
  }

  stageDescription(stage: string): string {
    const map: Record<string, string> = {
      'Applied': 'Candidate submitted their application.',
      'Screening': 'Initial screening call with HR.',
      'Interview': 'Technical or panel interview.',
      'Offer': 'Offer letter prepared and sent.',
      'Hired': 'Candidate accepted and onboarding started.',
    };
    return map[stage] ?? '';
  }

  onReject(): void {
    this._Router.navigate(['/application-management'])
  }
  onScheduleInterview(): void {
    this._Router.navigate(['/add-application']);
  }
  onViewJobDescription(): void { console.log('View Job Description'); }
  onEditNote(): void { console.log('Edit Note'); }
  onStageAction(action: { label: string; href?: string }): void { console.log('Action:', action.label); }
}