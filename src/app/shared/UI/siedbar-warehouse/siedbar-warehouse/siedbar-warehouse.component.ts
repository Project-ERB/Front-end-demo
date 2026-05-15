import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';

@Component({
  selector: 'app-siedbar-warehouse',
  imports: [RouterModule, RouterLink],
  templateUrl: './siedbar-warehouse.component.html',
  styleUrl: './siedbar-warehouse.component.scss',
})
export class SiedbarWarehouseComponent {

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  onLogout(): void {
    this._authService.logout();
    this._router.navigate(['/admin-login']);
  }


}
