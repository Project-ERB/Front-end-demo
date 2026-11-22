import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  animations: [
    trigger('panelReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-26px) scale(0.98)' }),
        animate('560ms ease-out', style({ opacity: 1, transform: 'translateX(0) scale(1)' })),
      ]),
    ]),
    trigger('formReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        animate('460ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class AdminLoginComponent {
  navLinks = [
    { label: 'HR Management', path: '/admin-login/HR-management', icon: 'groups' },
    { label: 'Administration', path: '/admin-login/administration', icon: 'shield_person' },
    { label: 'Warehouses', path: '/admin-login/warehouses', icon: 'warehouse' },
    { label: 'Sales', path: '/admin-login/sales', icon: 'trending_up' }
  ];
}
