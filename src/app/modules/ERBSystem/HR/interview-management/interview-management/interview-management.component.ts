import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { Environment } from '../../../../../shared/UI/environment/env';
import { map } from 'rxjs';
import { ApplicationsService } from '../../../../../core/services/Applications/applications.service';
import { ToastrService } from 'ngx-toastr';

export type FilterTab = 'All Interviews' | 'Upcoming' | 'Completed';

export interface Interview {
  id: string;
  applicationProcessId: string;
  interviewerName: string;
  interviewDate: string;
  location: string;
  interviewType: string; // بدل number
  stage: string;         // بدل number
}

@Component({
  selector: 'app-interview-management',
  imports: [CommonModule, FormsModule, HrSidebarComponent, RouterLink],
  templateUrl: './interview-management.component.html',
  styleUrl: './interview-management.component.scss',
})
export class InterviewManagementComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _applicationsService = inject(ApplicationsService);
  private readonly _ToastrService = inject(ToastrService)

  searchQuery = '';
  activeFilter = signal<FilterTab>('All Interviews');
  allInterviews = signal<Interview[]>([]);


  // Edit Modal
  showEditModal = false;
  isUpdating = false;
  editError = '';
  editForm = {
    interviewId: '',
    interviewer: '',
    location: '',
    date: '',
    time: '',
  };

  readonly filterTabs: FilterTab[] = ['All Interviews', 'Upcoming', 'Completed'];

  readonly stats = [
    { label: 'Interviews Today', icon: 'today', value: '12', sub: '+2 from yesterday', subColor: 'text-emerald-500' },
    { label: 'Pending Feedback', icon: 'rate_review', value: '5', sub: 'Requires attention', subColor: 'text-amber-500' },
    { label: 'Avg. Completion Rate', icon: 'query_stats', value: '94%', sub: 'Last 30 days', subColor: 'text-slate-400' },
  ];

  readonly interviewTypeLabels: Record<string, string> = {
    'VideoCall': 'Video Call',
    'InPerson': 'In-Person',
    'Phone': 'Phone Call',
  };

  readonly interviewTypeColors: Record<string, string> = {
    'VideoCall': 'bg-blue-100 text-blue-700',
    'InPerson': 'bg-orange-100 text-orange-700',
    'Phone': 'bg-purple-100 text-purple-700',
  };

  readonly stageLabels: Record<string, string> = {
    'InitialScreening': 'Initial Screening',
    'TechnicalAssessment': 'Technical Assessment',
    'CulturalFit': 'Cultural Fit',
    'HRInterview': 'HR Interview',
    'FinalRound': 'Final Round',
  };

  currentPage = signal(1);
  readonly pageSize = 10;

  readonly totalPages = computed(() =>
    Math.ceil(this.allInterviews().length / this.pageSize)
  );
  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  readonly filteredInterviews = computed(() => this.allInterviews());

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    const query = `
      query {
        applicationInterviews {
          nodes {
            id
            applicationProcessId
            interviewerName
            interviewDate
            location
            interviewType
            stage
          }
        }
      }
    `;
    this._http
      .post<any>(`${Environment.baseUrl}/graphql`, { query })
      .pipe(map((res) => res.data.applicationInterviews.nodes as Interview[]))
      .subscribe({ next: (data) => this.allInterviews.set(data) });
  }

  setFilter(tab: FilterTab): void {
    this.activeFilter.set(tab);
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  lastEntryOnPage(): number {
    return Math.min(this.currentPage() * this.pageSize, this.allInterviews.length);
  }

  // فتح المودال وملء البيانات الحالية
  onEdit(interview: Interview): void {
    const dateObj = new Date(interview.interviewDate);
    this.editForm = {
      interviewId: interview.id,
      interviewer: interview.interviewerName,
      location: interview.location,
      date: dateObj.toISOString().split('T')[0],
      time: dateObj.toTimeString().slice(0, 5),
    };
    this.editError = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editError = '';
  }

  submitEdit(): void {
    if (!this.editForm.interviewer || !this.editForm.location || !this.editForm.date || !this.editForm.time) {
      this.editError = 'Please fill in all fields.';
      return;
    }

    this.isUpdating = true;
    this.editError = '';

    const interviewDate = new Date(`${this.editForm.date}T${this.editForm.time}:00`).toISOString();

    const payload = {
      interviewId: this.editForm.interviewId,
      interviewer: this.editForm.interviewer,
      location: this.editForm.location,
      interviewDate,
    };

    this._applicationsService.updateInterview(payload).subscribe({
      next: (res) => {
        console.log(res)
        this._ToastrService.success('Interview details updated successfully!', 'Success !');
        // تحديث البيانات محلياً
        this.allInterviews.update(list =>
          list.map(i => i.id === this.editForm.interviewId ?
            { ...i, interviewerName: this.editForm.interviewer, location: this.editForm.location, interviewDate }
            : i)
        );
        this.isUpdating = false;

        this.closeEditModal();
      },
      error: (err) => {
        this._ToastrService.error('Interview details updated Failed !', 'Failed !');
        this.isUpdating = false;
      },
    });
  }

  onDelete(interview: Interview): void {
    if (!confirm('Are you sure you want to delete this interview?')) return;

    this._applicationsService.deleteInterview(interview.id).subscribe({
      next: (res) => {
        console.log(res)
        this._ToastrService.success('Interview details Deleted successfully!', 'Success !');
        this.allInterviews.update(list => list.filter(i => i.id !== interview.id));
      },
      error: (err) => {
        this._ToastrService.error('Interview details Deleted Failed !', 'Failed !');
        console.error('Delete failed:', err);
      },
    });
  }

  private readonly _router = inject(Router);

  onView(interview: Interview): void {
    this._router.navigate(['/interview-details', interview.id]);
  }
}