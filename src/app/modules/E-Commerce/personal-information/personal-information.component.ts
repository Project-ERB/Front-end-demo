import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { NavbarECommerceComponent } from "../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";

interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

@Component({
  selector: 'app-personal-information',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NavbarECommerceComponent],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss',
})
export class PersonalInformationComponent {
  private readonly router = inject(Router);
  isEditMode = signal(false);
  activeMenuItem = signal('personal-information');

  userInfo = signal<UserInfo>({
    fullName: 'Eleanor Pena',
    email: 'el.pena@example.com',
    phone: '+1 (555) 123-4567',
    password: '********',
  });

  editForm: FormGroup = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  menuItems = [
    {
      id: 'personal-information',
      label: 'Personal Information',
      icon: 'person',
      route: '/account/personal-information',
    },
    {
      id: 'addresses',
      label: 'My Addresses',
      icon: 'location_on',
      route: '/account/addresses',
    },
    {
      id: 'payment-methods',
      label: 'Payment Methods',
      icon: 'credit_card',
      route: '/account/payment-methods',
    },
    {
      id: 'order-history',
      label: 'Order History',
      icon: 'list',
      route: '/account/order-history',
    },
  ];

  toggleEditMode() {
    if (this.isEditMode()) {
      // Save changes
      if (this.editForm.valid) {
        this.userInfo.set({
          fullName: this.editForm.value.fullName,
          email: this.editForm.value.email,
          phone: this.editForm.value.phone,
          password: '********', // Don't show actual password
        });
        this.isEditMode.set(false);
        console.log('User information updated');
      } else {
        this.editForm.markAllAsTouched();
      }
    } else {
      // Enter edit mode
      this.editForm.patchValue({
        fullName: this.userInfo().fullName,
        email: this.userInfo().email,
        phone: this.userInfo().phone,
        password: '', // Clear password field
      });
      this.isEditMode.set(true);
    }
  }

  cancelEdit() {
    this.isEditMode.set(false);
    this.editForm.reset();
  }

  logout() {
    // TODO: Implement logout logic
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }

  setActiveMenuItem(itemId: string) {
    this.activeMenuItem.set(itemId);
  }
}
