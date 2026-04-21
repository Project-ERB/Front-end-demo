import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarECommerceComponent } from "../../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";
import { ECommerceService } from '../../../../core/services/e-commerce/e-commerce.service';
import { RouterLink } from "@angular/router";
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

interface Address {
  label: string;
  line: string;
  isDefault: boolean;
}

interface Customer {
  id: string;           // ✅ من الـ Query
  name: string;
  phone: string;
  isActive: boolean;    // ✅ من الـ Query
  creditLimitAmount: number; // ✅ من الـ Query
  currency: string;     // ✅ من الـ Query
  // باقي الـ fields المحلية
  email: string;
  dateOfBirth: string;
  gender: string;
  avatarUrl?: string;
  membershipTier: string;
  totalOrders: number;
  wishlistCount: number;
  reviewsCount: number;
  addresses: Address[];
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Cancelled';
}

@Component({
  selector: 'app-customer-profile',
  imports: [CommonModule, FormsModule, NavbarECommerceComponent, RouterLink],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('420ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('contentStagger', [
      transition('* => *', [
        query(
          '.profile-card',
          [
            style({ opacity: 0, transform: 'translateY(14px) scale(0.98)' }),
            stagger(90, [animate('320ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class CustomerProfileComponent implements OnInit {

  private readonly _ECommerceService = inject(ECommerceService);

  customer: Customer | null = null;
  recentOrders: Order[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isEditing = false;
  isSaving = false;
  isChangingPassword = false;
  isMobileSidebarOpen = false;

  editForm = {
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  };

  passwordForm = {
    current: '',
    newPass: '',
    confirm: '',
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this._ECommerceService.getCustomerProfile().subscribe({
      next: (res) => {
        // بناخد أول customer من الـ nodes
        const node = res?.data?.customers?.nodes?.[0];

        if (node) {
          this.customer = {
            id: node.id,
            name: node.name,
            phone: node.phone,
            isActive: node.isActive,
            creditLimitAmount: node.creditLimitAmount,
            currency: node.currency,
            // Default values للـ fields اللي مش في الـ Query
            email: '',
            dateOfBirth: '',
            gender: '',
            avatarUrl: '',
            membershipTier: 'Standard Member',
            totalOrders: 0,
            wishlistCount: 0,
            reviewsCount: 0,
            addresses: [],
          };
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  startEditing(): void {
    if (!this.customer) return;
    this.editForm = {
      name: this.customer.name,
      email: this.customer.email,
      phone: this.customer.phone,
      dateOfBirth: this.customer.dateOfBirth,
      gender: this.customer.gender,
    };
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  saveProfile(): void {
    this.isSaving = true;
    this.errorMessage = '';

    setTimeout(() => {
      if (this.customer) {
        this.customer = { ...this.customer, ...this.editForm };
      }
      this.isSaving = false;
      this.isEditing = false;
      this.showSuccess('Profile updated successfully!');
    }, 1000);
  }

  changePassword(): void {
    if (!this.passwordForm.current || !this.passwordForm.newPass || !this.passwordForm.confirm) {
      this.errorMessage = 'Please fill in all password fields.';
      return;
    }
    if (this.passwordForm.newPass !== this.passwordForm.confirm) {
      this.errorMessage = 'New passwords do not match.';
      return;
    }

    this.isChangingPassword = true;
    this.errorMessage = '';

    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordForm = { current: '', newPass: '', confirm: '' };
      this.showSuccess('Password updated successfully!');
    }, 1000);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 4000);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }
}