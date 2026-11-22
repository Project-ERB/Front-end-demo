import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../../core/services/Auth/auth.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent {
  private readonly _toastrService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  isLoading: boolean = false;
  showPassword: boolean = false;

  loginForm: FormGroup = this._formBuilder.group({
    email: ['yepego6870@jsncos.com', [Validators.required, Validators.email]],
    password: ['SalesManger#21976', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
    ]],
    rememberMe: [false]
  });

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this._authService.AdminLogin({ email, password }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this._authService.saveAuthData(res);
        this._toastrService.success('Login successful as Sales Manager', 'Success');
        this._router.navigate(['/sales-analysis']);
      },
      error: () => {
        this.isLoading = false;
        this._toastrService.error('Login failed. Please check your credentials.', 'Error');
      }
    });
  }
}
