import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Candidate {
  id: number;
  name: string;
  role: string;
}

interface JobReq {
  id: number;
  code: string;
  title: string;
}

interface ProcessForm {
  candidateId: number | null;
  jobId: number | null;
  startDate: string;
  initialStage: string;
  notes: string;
}

@Component({
  selector: 'app-add-application',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.scss',
})
export class AddApplicationComponent {

  candidates: Candidate[] = [
    { id: 1, name: 'Jordan Smith', role: 'Senior Developer' },
    { id: 2, name: 'Sarah Chen', role: 'UI Designer' },
    { id: 3, name: 'Marcus Miller', role: 'Project Manager' },
  ];

  jobs: JobReq[] = [
    { id: 1, code: 'REQ-001', title: 'Backend Engineer (Java)' },
    { id: 2, code: 'REQ-002', title: 'Product Designer' },
    { id: 3, code: 'REQ-003', title: 'DevOps Architect' },
  ];

  stages = [
    { value: 'screening', label: 'Initial Screening' },
    { value: 'technical', label: 'Technical Assessment' },
    { value: 'interview', label: 'Culture Fit Interview' },
    { value: 'offer', label: 'Offer Preparation' },
  ];

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'person_search', label: 'Candidates', active: false },
    { icon: 'work', label: 'Jobs', active: false },
    { icon: 'description', label: 'Applications', active: true },
    { icon: 'analytics', label: 'Reports', active: false },
  ];

  form: ProcessForm = {
    candidateId: null,
    jobId: null,
    startDate: '',
    initialStage: 'screening',
    notes: '',
  };

  onSubmit(): void {
    console.log('Form submitted:', this.form);
    // handle submission logic
  }

  onCancel(): void {
    this.form = {
      candidateId: null,
      jobId: null,
      startDate: '',
      initialStage: 'screening',
      notes: '',
    };
  }

}
