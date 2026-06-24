import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { RouterLink } from "@angular/router";
import { ApplicationOffer, ApplicationsService } from '../../../../../core/services/Applications/applications.service';

export type OfferStatus = 'Accepted' | 'Sent' | 'Draft' | 'Rejected';

export interface Offer {
  id: number;
  initials: string;
  candidateName: string;
  interviewDate: string;
  jobTitle: string;
  workType: string;
  location: string;
  salary: string;
  currency: string;
  expiration: string;
  status: OfferStatus;
  isActive: boolean;
}

@Component({
  selector: 'app-offer-management',
  imports: [CommonModule, FormsModule, HrSidebarComponent, RouterLink],
  templateUrl: './offer-management.component.html',
  styleUrl: './offer-management.component.scss',
})
export class OfferManagementComponent implements OnInit {
  private readonly _appService = inject(ApplicationsService);

  searchQuery = '';
  selectedPeriod = 'Last 30 Days';
  activeFilter: number | 'All Status' = 'All Status'; // ← number مش OfferStatus

  periods = ['Last 30 Days', 'Last 6 Months', 'Year to Date'];

  statusFilters: { label: string; value: number | 'All Status' }[] = [
    { label: 'All Status', value: 'All Status' },
    { label: 'Draft', value: 0 },
    { label: 'Sent', value: 1 },
    { label: 'Accepted', value: 2 },
    { label: 'Rejected', value: 3 },
  ];

  stats = [
    {
      label: 'Total Offers',
      value: '0',
      trend: '+12%',
      trendUp: true,
      icon: 'description',
      colorClass: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Accepted',
      value: '0',
      trend: '+5%',
      trendUp: true,
      icon: 'check_circle',
      colorClass: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Pending',
      value: '0',
      trend: '-2%',
      trendUp: false,
      icon: 'schedule',
      colorClass: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Conv. Rate',
      value: '0%',
      trend: '+3.1%',
      trendUp: true,
      icon: 'query_stats',
      colorClass: 'bg-indigo-100 text-indigo-600',
    },
  ];

  allOffers: ApplicationOffer[] = [];

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this._appService.getOffers().subscribe({
      next: (data) => {
        this.allOffers = data;

        const total = data.length;
        const accepted = data.filter(o => o.offerStatus === 2).length;
        const pending = data.filter(o => o.offerStatus === 1).length;
        const rate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0';
        this.stats[0].value = total.toString();
        this.stats[1].value = accepted.toString();
        this.stats[2].value = pending.toString();
        this.stats[3].value = `${rate}%`;
      },
      error: (err) => console.error(err),
    });

    // ✅ جيب كل الـ interviews مرة واحدة وعمل map
    this._appService.getInterviews().subscribe({
      next: (interviews) => {
        interviews.forEach((iv: any) => {
          this.interviewerMap[iv.id] = iv.interviewerName ?? 'Unknown';
        });
      }
    });
  }

  get filteredOffers(): ApplicationOffer[] { // ← ApplicationOffer مش Offer
    return this.allOffers.filter((offer) => {
      const matchesStatus =
        this.activeFilter === 'All Status' ||
        offer.offerStatus === this.activeFilter;
      const matchesSearch =
        !this.searchQuery ||
        offer.id.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  setFilter(value: number | 'All Status'): void {
    this.activeFilter = value;
  }

  toggleActive(offer: ApplicationOffer): void {
    offer.isAvailable = !offer.isAvailable;
  }

  getStatusLabel(status: any): string {
    return status ?? 'Unknown';
  }


  getStatusClasses(status: any): string {
    const map: Record<string, string> = {
      'Draft': 'bg-slate-100 text-slate-600',
      'Sent': 'bg-amber-100 text-amber-700',
      'Accepted': 'bg-emerald-100 text-emerald-700',
      'Rejected': 'bg-rose-100 text-rose-700',
    };
    return map[status] ?? '';
  }

  acceptOffer(offer: ApplicationOffer): void {
    if (this.isExpired(offer.expireDate)) {
      alert('Cannot accept an expired offer.');
      return;
    }

    this._appService.acceptOffer(offer.id).subscribe({
      next: () => offer.offerStatus = 2,
      error: (err) => console.error('Error accepting offer:', err),
    });
  }

  rejectOffer(offer: ApplicationOffer): void {
    if (this.isExpired(offer.expireDate)) {
      alert('Cannot reject an expired offer.');
      return;
    }

    this._appService.rejectOffer(offer.id).subscribe({
      next: () => offer.offerStatus = 3,
      error: (err) => console.error('Error rejecting offer:', err),
    });
  }

  // helper
  isExpired(expireDate: string): boolean {
    return new Date(expireDate) < new Date();
  }

  interviewerMap: Record<string, string> = {};


}
