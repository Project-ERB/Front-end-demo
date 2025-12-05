import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { inject } from '@angular/core';


interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}
@Component({
  selector: 'app-security',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss',
  

})
export class SecurityComponent {
  activeMenuItem = signal('security');
  is2FAEnabled = signal(true);
  private readonly router = inject(Router);

  userInfo = {
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
  };

  menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person',
      route: '/account/personal-information',
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'lock',
      route: '/account/security',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications',
      route: '/account/notifications',
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: 'tune',
      route: '/account/preferences',
    },
    {
      id: 'privacy',
      label: 'Privacy & Data',
      icon: 'security',
      route: '/account/privacy',
    },
  ];

  passwordFormsec: FormGroup = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );

  passwordMatchValidator(
    group: AbstractControl
  ): null | Record<string, boolean> {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  setActiveMenuItem(itemId: string) {
    this.activeMenuItem.set(itemId);
  }

  updatePassword() {
    if (this.passwordFormsec.valid) {
      console.log('Updating password...');
      // TODO: Implement password update logic
      this.passwordFormsec.reset();
    } else {
      this.passwordFormsec.markAllAsTouched();
    }
  }

  cancelPasswordChange() {
    this.passwordFormsec.reset();
  }

  toggle2FA() {
    if (this.is2FAEnabled()) {
      // TODO: Show confirmation dialog
      this.is2FAEnabled.set(false);
      console.log('2FA disabled');
    } else {
      // TODO: Navigate to 2FA setup
      this.is2FAEnabled.set(true);
      console.log('2FA enabled');
    }
  }

  logout() {
    // TODO: Implement logout logic
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }
}
