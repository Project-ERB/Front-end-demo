import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Environment } from '../../../../../shared/UI/environment/env';
import { map } from 'rxjs';

export type InterviewOutcome = 'pass' | 'fail' | 'reschedule' | null;

export interface SkillRating {
  label: string;
  rating: number;
}

@Component({
  selector: 'app-interview-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-details.component.html',
  styleUrl: './interview-details.component.scss',
})
export class InterviewDetailsComponent implements OnInit {

  private readonly _route = inject(ActivatedRoute);
  private readonly _http = inject(HttpClient);

  showDeactivateModal = signal(false);
  selectedOutcome = signal<InterviewOutcome>(null);
  feedback = '';
  interviewData = signal<any>(null);

  skillRatings = signal<SkillRating[]>([
    { label: 'Technical Knowledge', rating: 4 },
    { label: 'Culture Fit', rating: 5 },
  ]);

  readonly candidate = {
    name: 'Alex Thompson',
    role: 'Senior Product Designer',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVy-J7-KgzhimP8bS4WXyLRl1V-xYga2tYrgFliVV9sw8zEfPuBCGfdrfqH40dvlGI0M5JSQWBdMNds1DXqSih8TyVxOfUQQ-qKlBiL0ZRAuipPj9vrOnLES_3nBRdi8WaayQ13SGCkm-k5fymh0FPybzlVU9GLUOAc6fTUibYK9rwFDEaWhyFz4QzRXJaQAPC5jGmplDVifo_ANlmgf3yauwmZlbRbu20652HlPA6llaRaPCXmZ0lVyjIiV-7yUVOjU56lciScppF',
  };

  readonly outcomes: {
    value: InterviewOutcome;
    label: string;
    sub: string;
    icon: string;
    activeRing: string;
    iconColor: string;
  }[] = [
      { value: 'pass', label: 'Pass', sub: 'Move to next stage', icon: 'check_circle', activeRing: 'border-green-500 ring-1 ring-green-500', iconColor: 'text-green-500' },
      { value: 'fail', label: 'Fail', sub: 'Reject candidate', icon: 'cancel', activeRing: 'border-red-500 ring-1 ring-red-500', iconColor: 'text-red-500' },
      { value: 'reschedule', label: 'Reschedule', sub: 'Needs another round', icon: 'event_repeat', activeRing: 'border-amber-500 ring-1 ring-amber-500', iconColor: 'text-amber-500' },
    ];

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    const query = `
      query {
        applicationInterview(id: "${id}") {
          id
          applicationProcessId
          interviewerName
          interviewDate
          location
          interviewType
          stage
        }
      }
    `;
    this._http
      .post<any>(`${Environment.baseUrl}/graphql`, { query })
      .pipe(map((res) => res.data.applicationInterview))
      .subscribe({ next: (data) => this.interviewData.set(data) });
  }

  stars(count: number): number[] {
    return Array.from({ length: count });
  }

  setOutcome(value: InterviewOutcome): void {
    this.selectedOutcome.set(value);
  }

  setRating(index: number, rating: number): void {
    const updated = [...this.skillRatings()];
    updated[index] = { ...updated[index], rating };
    this.skillRatings.set(updated);
  }

  onSubmit(): void {
    console.log('Submitting result:', {
      outcome: this.selectedOutcome(),
      feedback: this.feedback,
      skills: this.skillRatings(),
    });
  }

  onDiscard(): void {
    this.selectedOutcome.set(null);
    this.feedback = '';
    this.skillRatings.set([
      { label: 'Technical Knowledge', rating: 4 },
      { label: 'Culture Fit', rating: 5 },
    ]);
  }

  openDeactivateModal(): void { this.showDeactivateModal.set(true); }
  closeDeactivateModal(): void { this.showDeactivateModal.set(false); }
  confirmDeactivation(): void {
    console.log('Interview deactivated');
    this.closeDeactivateModal();
  }
}