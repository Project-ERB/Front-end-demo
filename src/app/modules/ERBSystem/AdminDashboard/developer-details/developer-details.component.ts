import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DeveloperService } from '../../../../core/services/Developer/developer.service';
import { SiedeAdminComponent } from '../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';

interface EndpointDetail {
  id: string;
  path: string;
  method: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

@Component({
  selector: 'app-developer-details',
  standalone: true,
  imports: [CommonModule, SiedeAdminComponent],
  templateUrl: './developer-details.component.html',
  styleUrl: './developer-details.component.scss'
})
export class DeveloperDetailsComponent implements OnInit {

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _developerService: DeveloperService
  ) { }

  endpoint: EndpointDetail | null = null;
  loading = true;
  error = false;

  ngOnInit() {
    const id = this._route.snapshot.paramMap.get('id');
    if (!id) {
      this._router.navigate(['/developer']);
      return;
    }
    this.loadEndpoint(id);
  }

  loadEndpoint(id: string) {
    this.loading = true;
    this.error = false;
    this._developerService.getEndpointById(id).subscribe({
      next: (res: any) => {
        this.loading = false;

        console.log(res); // مهم تشوف شكل الريسبونس

        if (res?.data?.endpoint) {
          this.endpoint = res.data.endpoint;
        } else {
          this.error = true;
        }
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.error = true;
      }
    });
  }

  goBack() {
    this._router.navigate(['/developer']);
  }

  getMethodColor(method: string): string {
    const m = method?.toUpperCase() || 'GET';
    if (m === 'GET') return 'bg-blue-100 text-blue-700';
    if (m === 'POST') return 'bg-green-100 text-green-700';
    if (m === 'PUT') return 'bg-yellow-100 text-yellow-700';
    if (m === 'DELETE') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  }

  getMethodBorder(method: string): string {
    const m = method?.toUpperCase() || 'GET';
    if (m === 'GET') return 'border-blue-200 bg-blue-50/30';
    if (m === 'POST') return 'border-green-200 bg-green-50/30';
    if (m === 'PUT') return 'border-yellow-200 bg-yellow-50/30';
    if (m === 'DELETE') return 'border-red-200 bg-red-50/30';
    return 'border-gray-200 bg-gray-50/30';
  }

  toggling = false;

  toggleActive() {
    if (!this.endpoint || this.toggling) return;
    this.toggling = true;
    const newStatus = !this.endpoint.isActive;

    this._developerService.updateEndpoint(this.endpoint.id, newStatus).subscribe({
      next: () => {
        this.endpoint!.isActive = newStatus;
        this.toggling = false;
      },
      error: (err: any) => {
        console.error(err);
        this.toggling = false;
      }
    });
  }
}