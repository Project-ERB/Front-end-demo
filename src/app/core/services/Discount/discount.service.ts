import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

export interface DiscountTarget {
  tagetType: number; // 0 = store, 1 = collections, 2 = customers
  targetId: string;
}

export interface CreateDiscountPayload {
  code: string;
  name: string;
  description: string;
  discountType: number; // 0 = percentage, 1 = fixed, 2 = bxgy
  discountValueAmount: number;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  targets: DiscountTarget[];
  buyQuantity: number;
  getQuantity: number;
  getDiscountPercentage: number;
  currency: string;
  minimumPurchaseAmount: number;
  minimumQuantity: number;
  maximumDiscountAmount: number;
  canCombineWithOtherDiscounts: boolean;
  usageLimitPerCustomer: number;
  totalUsageLimit: number;
}

@Injectable({
  providedIn: 'root',
})
export class DiscountService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly _HttpClient = inject(HttpClient);

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
    });
  }

  AddDiscount(data: CreateDiscountPayload): Observable<any> {
    return this._HttpClient.post(
      `${Environment.baseUrl}/api/Discount/DraftDiscount`,
      data,
      { headers: this.getHeaders() }
    );
  }
}