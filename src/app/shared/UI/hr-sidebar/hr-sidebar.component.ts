import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-hr-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './hr-sidebar.component.html',
  styleUrl: './hr-sidebar.component.scss',
})
export class HrSidebarComponent implements OnDestroy {
  isSidebarOpen = false;
  private routerSub: Subscription;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {
    // إغلاق الـ sidebar تلقائياً عند التنقل
    this.routerSub = this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeSidebar();
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  onLogout(): void {
    this._authService.logout();
    this._router.navigate(['/admin-login']);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}