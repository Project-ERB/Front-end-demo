import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';

@Component({
  selector: 'app-siedbar-warehouse',
  imports: [RouterModule, RouterLink],
  templateUrl: './siedbar-warehouse.component.html',
  styleUrl: './siedbar-warehouse.component.scss',
})
export class SiedbarWarehouseComponent {

  // <--- تم الإضافة
  @Input() isMobileOpen: boolean = false;
  @Output() closeMobile = new EventEmitter<void>();

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  // <--- تم الإضافة: دالة تقفل الـ drawer لما تضغط على لينك
  onLinkClick(): void {
    if (this.isMobileOpen) {
      this.closeMobile.emit();
    }
  }

  // <--- تم الإضافة: دالة تقفل الـ drawer من زرار الـ X
  onCloseMobile(): void {
    this.closeMobile.emit();
  }

  onLogout(): void {
    this.onLinkClick(); // نقفل الـ drawer الأول
    this._authService.logout();
    this._router.navigate(['/admin-login']);
  }
}