import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar-e-commerce',
  imports: [],
  templateUrl: './navbar-e-commerce.component.html',
  styleUrl: './navbar-e-commerce.component.scss',
})
export class NavbarECommerceComponent {

  private readonly _Router = inject(Router);

  navigateToShopCart() {
    this._Router.navigate(['/cart']);
  }

}
