import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../../core/services/Auth/auth.service';

@Component({
  selector: 'app-sideba-sales',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sideba-sales.component.html',
  styleUrl: './sideba-sales.component.scss',
})
export class SidebaSalesComponent {

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  onLogout(): void {
    this._authService.logout();
    this._router.navigate(['/admin-login']);
  }

}
