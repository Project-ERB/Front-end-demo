import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-schedule-interview',
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-interview.component.html',
  styleUrl: './schedule-interview.component.scss',
})
export class ScheduleInterviewComponent {

  // Work preference toggle
  workPreference = signal<'OFFICE' | 'REMOTE'>('OFFICE');

  // Form model
  form = {
    candidateName: '',
    interviewStage: 'Initial Screening',
    interviewerName: '',
    interviewType: 'Video Call',
    date: '',
    time: '',
    location: '',
  };

  interviewStages = [
    'Initial Screening',
    'Technical Assessment',
    'Cultural Fit',
    'Final Management Round',
  ];

  interviewTypes = ['Video Call', 'In-Person', 'Phone Call'];

  setWorkPreference(pref: 'OFFICE' | 'REMOTE'): void {
    this.workPreference.set(pref);
    // Clear location when toggling
    this.form.location = '';
  }

  onSubmit(): void {
    console.log('Scheduling interview with:', {
      ...this.form,
      workPreference: this.workPreference(),
    });
    // TODO: Connect to your scheduling service
  }

  onCancel(): void {
    this.form = {
      candidateName: '',
      interviewStage: 'Initial Screening',
      interviewerName: '',
      interviewType: 'Video Call',
      date: '',
      time: '',
      location: '',
    };
    this.workPreference.set('OFFICE');
  }

}
