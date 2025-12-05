import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarECommerceComponent } from "../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";

@Component({
  selector: 'app-home',
  imports: [RouterModule, NavbarECommerceComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
}
