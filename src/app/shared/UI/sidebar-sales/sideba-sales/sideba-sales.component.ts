import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../../core/services/Auth/auth.service';
import { SiedbarWarehouseComponent } from "../../siedbar-warehouse/siedbar-warehouse/siedbar-warehouse.component";

@Component({
  selector: 'app-sideba-sales',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sideba-sales.component.html',
  styleUrl: './sideba-sales.component.scss',
})
export class SidebaSalesComponent {

  // دول الاتنين لازم يكونوا موجودين
  @Input() isMobileOpen: boolean = false;
  @Output() closeMobile = new EventEmitter<void>();

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  onLinkClick(): void {
    if (this.isMobileOpen) {
      this.closeMobile.emit();
    }
  }

  onCloseMobile(): void {
    this.closeMobile.emit();
  }

  onLogout(): void {
    this.onLinkClick();
    this._authService.logout();
    this._router.navigate(['/admin-login']);
  }
}