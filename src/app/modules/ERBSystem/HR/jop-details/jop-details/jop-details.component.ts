import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { JopService } from '../../../../../core/services/jop/jop.service';
import { forkJoin } from 'rxjs';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";

@Component({
  selector: 'app-jop-details',
  imports: [CommonModule, HrSidebarComponent],
  templateUrl: './jop-details.component.html',
  styleUrl: './jop-details.component.scss',
})
export class JopDetailsComponent implements OnInit {
  private readonly _Route = inject(ActivatedRoute);
  private readonly _JopService = inject(JopService);

  isDarkMode = false;
  isLoading = true;
  job: any = null;
  departmentName = '—';

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'work', label: 'Requirements', active: true },
    { icon: 'group', label: 'Candidates', active: false },
    { icon: 'badge', label: 'Employees', active: false },
    { icon: 'analytics', label: 'Reports', active: false },
  ];

  ngOnInit(): void {
    const id = this._Route.snapshot.paramMap.get('id');
    if (!id) return;

    forkJoin({
      recruitment: this._JopService.getRecruitmentById(id),
      departments: this._JopService.getDepartments(),
    }).subscribe({
      next: ({ recruitment, departments }) => {
        this.job = recruitment;
        const dept = departments.find((d: any) => d.id === recruitment.departmentId);
        this.departmentName = dept?.name ?? '—';
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  get salaryRange(): string {
    if (!this.job) return '—';
    return `${this.job.minSalaryAmount?.toLocaleString('en-US')} – ${this.job.maxSalaryAmount?.toLocaleString('en-US')} ${this.job.minSalaryCurrency}`;
  }

  get statusClasses(): string {
    return 'bg-green-100 text-green-700';
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }
}