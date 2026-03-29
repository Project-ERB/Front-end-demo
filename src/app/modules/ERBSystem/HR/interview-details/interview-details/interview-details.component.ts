import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type InterviewOutcome = 'pass' | 'fail' | 'reschedule' | null;

export interface SkillRating {
  label: string;
  rating: number; // 1–5
}

@Component({
  selector: 'app-interview-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-details.component.html',
  styleUrl: './interview-details.component.scss',
})
export class InterviewDetailsComponent {

  // ── Modal visibility ──────────────────────────────────────
  showDeactivateModal = signal(false);

  // ── Form state ────────────────────────────────────────────
  selectedOutcome = signal<InterviewOutcome>(null);
  feedback = '';

  skillRatings = signal<SkillRating[]>([
    { label: 'Technical Knowledge', rating: 4 },
    { label: 'Culture Fit', rating: 5 },
  ]);

  // ── Static interview metadata ─────────────────────────────
  readonly interview = {
    id: '#12345',
    role: 'Senior Product Designer',
    interviewer: { name: 'Sarah Jenkins', title: 'Design Director' },
    dateLabel: 'October 24, 2023',
    timeLabel: '10:00 AM – 11:00 AM (EST)',
    location: 'Virtual Meeting',
    locationSub: 'Google Meet (Link in Invite)',
    stage: 'Technical Assessment',
    stageNumber: 3,
    type: 'On-Site',
  };

  readonly candidate = {
    name: 'Alex Thompson',
    role: 'Senior Product Designer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDVy-J7-KgzhimP8bS4WXyLRl1V-xYga2tYrgFliVV9sw8zEfPuBCGfdrfqH40dvlGI0M5JSQWBdMNds1DXqSih8TyVxOfUQQ-qKlBiL0ZRAuipPj9vrOnLES_3nBRdi8WaayQ13SGCkm-k5fymh0FPybzlVU9GLUOAc6fTUibYK9rwFDEaWhyFz4QzRXJaQAPC5jGmplDVifo_ANlmgf3yauwmZlbRbu20652HlPA6llaRaPCXmZ0lVyjIiV-7yUVOjU56lciScppF',
  };

  readonly outcomes: {
    value: InterviewOutcome;
    label: string;
    sub: string;
    icon: string;
    activeRing: string;
    iconColor: string;
  }[] = [
      {
        value: 'pass',
        label: 'Pass',
        sub: 'Move to next stage',
        icon: 'check_circle',
        activeRing: 'border-green-500 ring-1 ring-green-500',
        iconColor: 'text-green-500',
      },
      {
        value: 'fail',
        label: 'Fail',
        sub: 'Reject candidate',
        icon: 'cancel',
        activeRing: 'border-red-500 ring-1 ring-red-500',
        iconColor: 'text-red-500',
      },
      {
        value: 'reschedule',
        label: 'Reschedule',
        sub: 'Needs another round',
        icon: 'event_repeat',
        activeRing: 'border-amber-500 ring-1 ring-amber-500',
        iconColor: 'text-amber-500',
      },
    ];

  // ── Helpers ───────────────────────────────────────────────
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

  openDeactivateModal(): void {
    this.showDeactivateModal.set(true);
  }

  closeDeactivateModal(): void {
    this.showDeactivateModal.set(false);
  }

  confirmDeactivation(): void {
    console.log('Interview deactivated');
    this.closeDeactivateModal();
  }

}
