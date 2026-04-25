import { DepartmentService, DepartmentNode } from './../../../../../core/services/Auth/department/department.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";

export interface Employee {
  id: string; name: string; avatar: string;
  designation: string; email: string;
  status: 'Active' | 'On Leave' | 'Inactive';
}

@Component({
  selector: 'app-department-details',
  imports: [FormsModule, CommonModule, RouterLink, HrSidebarComponent],
  templateUrl: './department-details.component.html',
  styleUrl: './department-details.component.scss',
})
export class DepartmentDetailsComponent implements OnInit {

  department: DepartmentNode | null = null;
  isLoading = true;
  error = '';

  filterQuery = '';
  currentPage = 1;
  totalPages = [1];

  // Employees مش في الـ query حالياً — placeholder
  employees: Employee[] = [];

  constructor(
    private _route: ActivatedRoute,
    private _DepartmentService: DepartmentService,
  ) { }

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'No department ID provided.'; this.isLoading = false; return; }

    this._DepartmentService.getDepartmentById(id).subscribe({
      next: (data) => {
        this.department = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load department details.';
        this.isLoading = false;
      },
    });
  }

  get filteredEmployees(): Employee[] {
    if (!this.filterQuery.trim()) return this.employees;
    const q = this.filterQuery.toLowerCase();
    return this.employees.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      'Active': 'bg-green-100 text-green-700',
      'On Leave': 'bg-amber-100 text-amber-700',
      'Inactive': 'bg-red-100   text-red-700',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }

  setPage(page: number): void { this.currentPage = page; }
}