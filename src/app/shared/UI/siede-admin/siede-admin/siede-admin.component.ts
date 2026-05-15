import { Component, Input, Output, EventEmitter, HostListener, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-siede-admin',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './siede-admin.component.html',
  styleUrl: './siede-admin.component.scss',
})
export class SiedeAdminComponent implements OnDestroy, OnChanges {

  // ═══ الإضافات الجديدة ═══
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  // ════════════════════════

  sidebarOpen = false;
  private sub?: Subscription;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {
    this.sub = this._router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.sidebarOpen = false;
      document.body.style.overflow = '';

      // أغلق الـ overlay في الموبايل عند التنقل
      if (this.isOpen) {
        this.closed.emit();
      }
    });
  }

  // ═══ تتبع تغيرات الـ Input ═══
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.sidebarOpen = this.isOpen;
      document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.sidebarOpen) this.close();
  }

  toggle(): void {
    this.sidebarOpen = !this.sidebarOpen;
    document.body.style.overflow = this.sidebarOpen ? 'hidden' : '';
  }

  close(): void {
    this.sidebarOpen = false;
    document.body.style.overflow = '';

    // أرسل إشعار إغلاق لو كان شغال كـ overlay
    if (this.isOpen) {
      this.closed.emit();
    }
  }

  onLogout(): void {
    this.close();
    this._authService.logout();
    this._router.navigate(['/admin-login']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    document.body.style.overflow = '';
  }
}