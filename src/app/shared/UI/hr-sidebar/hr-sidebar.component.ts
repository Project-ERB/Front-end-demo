import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../core/services/Auth/auth.service';

@Component({
  selector: 'app-hr-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './hr-sidebar.component.html',
  styleUrl: './hr-sidebar.component.scss',
})
export class HrSidebarComponent {

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  onLogout(): void {
    this._authService.logout();
    this._router.navigate(['/admin-login']);
  }

}
