import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { Environment } from '../../../../../shared/UI/environment/env';
import { forkJoin, map } from 'rxjs';
import { ApplicationsService } from '../../../../../core/services/Applications/applications.service';
import { CandidateService } from '../../../../../core/services/candidate/candidate.service';
import { JopService } from '../../../../../core/services/jop/jop.service';

export interface Application {
  id: string;
  candidateId: string;
  recruitmentId: string;
  currentStage: string; // ← string بدل number
  appStatus: string;    // ← string بدل number
  candidateName: string;
  jobTitle: string;
}

@Component({
  selector: 'app-application-management',
  imports: [CommonModule, HrSidebarComponent, RouterLink],
  templateUrl: './application-management.component.html',
  styleUrl: './application-management.component.scss',
})
export class ApplicationManagementComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _applicationsService = inject(ApplicationsService);
  private readonly _candidateService = inject(CandidateService);
  private readonly _jobService = inject(JopService);

  activeFilter = 'all';
  applications: Application[] = [];

  filters = [
    { key: 'all', label: 'All Apps', count: 0 },
    { key: '0', label: 'Screening', count: 0 },
    { key: '1', label: 'Interviews', count: 0 },
    { key: '2', label: 'Offers', count: 0 },
  ];

  stageLabels: Record<string, string> = {
    'Applied': 'Applied',
    'Screening': 'Screening',
    'Interview': 'Interview',
    'Offer': 'Offer',
    'Hired': 'Hired',
    'Rejected': 'Rejected',
  };

  stageColors: Record<string, string> = {
    'Applied': 'slate',
    'Screening': 'blue',
    'Interview': 'indigo',
    'Offer': 'violet',
    'Hired': 'green',
    'Rejected': 'rose',
  };

  statusLabels: Record<string, string> = {
    'Pending': 'Pending',
    'Active': 'Active',
    'Rejected': 'Rejected',
    'Hired': 'Hired',
  };

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    const query = `
      query {
        applicationProccessQuery {
          nodes {
            id
            candidateId
            recruitmentId
            currentStage
            appStatus
          }
        }
      }
    `;

    // ← forkJoin عشان نجيب الـ 3 في نفس الوقت
    forkJoin({
      apps: this._http
        .post<any>(`${Environment.baseUrl}/graphql`, { query })
        .pipe(map((res) => res.data.applicationProccessQuery.nodes)),
      candidates: this._candidateService.getCandidates(),
      jobs: this._jobService.getRecruitments(),
    }).subscribe({
      next: ({ apps, candidates, jobs }) => {
        // ← Map الأسماء بسرعة
        const candidateMap = new Map(candidates.map((c: any) => [c.id, c.fullName]));
        const jobMap = new Map(jobs.map((j: any) => [j.id, j.title]));

        this.applications = apps.map((app: any) => ({
          ...app,
          candidateName: candidateMap.get(app.candidateId) ?? app.candidateId.slice(0, 8) + '...',
          jobTitle: jobMap.get(app.recruitmentId) ?? app.recruitmentId.slice(0, 8) + '...',
        }));

        this.updateFilterCounts();
      },
    });
  }

  updateFilterCounts(): void {
    this.filters[0].count = this.applications.length;
    this.filters[1].count = this.applications.filter(a => a.currentStage === 'Applied').length;
    this.filters[2].count = this.applications.filter(a => a.currentStage === 'Interview').length;
    this.filters[3].count = this.applications.filter(a => a.currentStage === 'Offer').length;
  }


  get filteredApplications(): Application[] {
    if (this.activeFilter === 'all') return this.applications;
    const stageMap: Record<string, string> = {
      '0': 'Applied',
      '1': 'Interview',
      '2': 'Offer',
    };
    return this.applications.filter(a => a.currentStage === stageMap[this.activeFilter]);
  }

  getStageClasses(stage: string): string {
    const map: Record<string, string> = {
      slate: 'bg-slate-100 text-slate-700',
      blue: 'bg-blue-50 text-blue-700',
      indigo: 'bg-indigo-50 text-indigo-700',
      violet: 'bg-violet-50 text-violet-700',
      green: 'bg-green-50 text-green-700',
      rose: 'bg-rose-50 text-rose-700',
    };
    return map[this.stageColors[stage]] ?? 'bg-slate-100 text-slate-700';
  }

  getStageDotClasses(stage: string): string {
    const map: Record<string, string> = {
      slate: 'bg-slate-400',
      blue: 'bg-blue-500',
      indigo: 'bg-indigo-500',
      violet: 'bg-violet-500',
      green: 'bg-green-500',
      rose: 'bg-rose-500',
    };
    return map[this.stageColors[stage]] ?? 'bg-slate-400';
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'bg-amber-50 text-amber-700',
      'Active': 'bg-emerald-50 text-emerald-700',
      'Rejected': 'bg-rose-50 text-rose-700',
      'Hired': 'bg-blue-50 text-blue-700',
    };
    return map[status] ?? 'bg-slate-100 text-slate-700';
  }

  onDelete(app: Application): void {
    if (!confirm('Are you sure you want to delete this application?')) return;

    this._applicationsService.deleteInterviewProcess(app.id).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => a.id !== app.id);
        this.updateFilterCounts();
      },
      error: (err) => console.error('Delete failed:', err),
    });
  }

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  private readonly _Router = inject(Router);

  onView(app: Application): void {
    this._Router.navigate(['/application-details', app.id]);
  }
}