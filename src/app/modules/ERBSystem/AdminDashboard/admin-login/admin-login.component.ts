import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      alert('Login successful! Redirecting to dashboard…');
    }, 1500);
  }
}
