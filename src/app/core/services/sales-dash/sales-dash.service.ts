import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SalesDashService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getSalesDashboard(startDate: string, endDate: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    const body = {
      query: `
      query GetDashboard($starDate: DateTime!, $endDate: DateTime!) {
        salesDashboard(starDate: $starDate, endDate: $endDate) {
          kpis {
            totalRevenue
            totalOrders
            averageOrderValue
            targetAmount
            targetAchievementPercentage
          }
          salesTrend {
            date
            revenue
            ordersCount
          }
          salesByCategory {
            categoryName
            revenue
            unitsSold
          }
          topProducts {
            productId
            productName
            categoryName
            unitsSold
            revenue
            stockStatus
          }
        }
      }
    `,
      variables: {
        starDate: startDate,
        endDate: endDate
      }
    };

    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/graphql`,
      body,
      { headers }
    );
  }
}