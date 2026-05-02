import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { forkJoin, map } from 'rxjs';
import { ApplicationsService } from '../../../../../core/services/Applications/applications.service';
import { Environment } from '../../../../../shared/UI/environment/env';
import { Router, RouterLink } from "@angular/router";
import { CandidateService } from '../../../../../core/services/candidate/candidate.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-schedule-interview',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './schedule-interview.component.html',
  styleUrl: './schedule-interview.component.scss',
})
export class ScheduleInterviewComponent implements OnInit {
  private readonly _applicationsService = inject(ApplicationsService);
  private readonly _http = inject(HttpClient);
  private readonly _candidateService = inject(CandidateService);

  workPreference = signal<'OFFICE' | 'REMOTE'>('OFFICE');
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  applications: { id: string; candidateName: string; currentStage: string }[] = [];

  form = {
    applicationProccessId: '',
    interviewer: '',
    location: '',
    date: '',
    time: '',
    interviewType: 0,
    stageName: 0,
  };

  interviewStages = [
    { value: 0, label: 'Initial Screening' },
    { value: 1, label: 'Technical Assessment' },
    { value: 2, label: 'Cultural Fit' },
    { value: 3, label: 'Final Management Round' },
  ];

  interviewTypes = [
    { value: 0, label: 'Video Call' },
    { value: 1, label: 'In-Person' },
    { value: 2, label: 'Phone Call' },
  ];

  ngOnInit(): void {
    const query = `
    query {
      applicationProccessQuery {
        nodes {
          id
          candidateId
          currentStage
          appStatus
        }
      }
    }
  `;

    forkJoin({
      apps: this._http
        .post<any>(`${Environment.baseUrl}/graphql`, { query })
        .pipe(map((res) => res.data.applicationProccessQuery.nodes)),
      candidates: this._candidateService.getCandidates(),
    }).subscribe({
      next: ({ apps, candidates }) => {
        const candidateMap = new Map(candidates.map((c: any) => [c.id, c.fullName]));
        this.applications = apps.map((app: any) => ({
          id: app.id,
          candidateName: candidateMap.get(app.candidateId) ?? 'Unknown',
          currentStage: app.currentStage,
        }));
      },
    });
  }

  setWorkPreference(pref: 'OFFICE' | 'REMOTE'): void {
    this.workPreference.set(pref);
    this.form.location = '';
  }

  private readonly _Router = inject(Router);
  private readonly _ToastrService = inject(ToastrService)

  onSubmit(): void {
    if (!this.form.applicationProccessId || !this.form.interviewer || !this.form.date || !this.form.time) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const interviewDate = new Date(`${this.form.date}T${this.form.time}:00`).toISOString();

    const payload = {
      applicationProccessId: this.form.applicationProccessId,
      interviewer: this.form.interviewer,
      location: this.form.location,
      interviewDate,
      interviewType: +this.form.interviewType,
      stageName: +this.form.stageName,
    };

    this._applicationsService.addInterview(payload).subscribe({
      next: (res) => {
        this._ToastrService.success('Interview scheduled successfully!', 'Success !')
        this.isSubmitting = false;
        this.onCancel();
        console.log(res)
        setTimeout(() => {
          this._Router.navigate(['/interview-management']);
        }, 3000);
      },
      error: (err) => {
        console.log(err)
        this._ToastrService.error('Interview scheduled failes!', 'Failed !')
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.form = {
      applicationProccessId: '',
      interviewer: '',
      location: '',
      date: '',
      time: '',
      interviewType: 0,
      stageName: 0,
    };
    this.workPreference.set('OFFICE');
  }
}