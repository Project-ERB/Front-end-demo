import { Component, ElementRef, inject, ViewChild, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { RxReactiveFormsModule, RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthService } from '../../../../core/services/Auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RxReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {
  private readonly _toastrService = inject(ToastrService);
  isLoading: boolean = false;
  private readonly _formBuilder = inject(FormBuilder)
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  @ViewChild('rememberMeinput') rememberMeinput!: ElementRef<HTMLInputElement>;
  loginform: FormGroup = this._formBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)]],
    confirmPassword: [null, RxwebValidators.compare({ fieldName: 'password' })],
    rememberMe: []
  })
  LoginSubmit() {
    if (this.loginform.valid) {
      this.isLoading = true;
      this._authService.AdminLogin(this.loginform.value).subscribe({
        next: (res) => {
          this._toastrService.success('Login successful', 'Success');
          this.isLoading = false;

          // store tokens
          this._authService.accessToken.set(res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('accessToken', res.accessToken);

          // ✅ store role
          localStorage.setItem('role', res.roles[0]);

          setTimeout(() => {
            const role = res.roles[0];

            if (role === 'SystemAdmin') {
              this._router.navigate(['/admin-dashboard']);
            } else if (role === 'SalesManager') {
              this._router.navigate(['/sales-analysis']);
            } else if (role === 'WarehouseManager') {
              this._router.navigate(['/warehouse-management'])
            }
            else {
              this._toastrService.error('Unauthorized role', 'Error');
            }
          }, 2000);
        },
        error: (err) => {
          this._toastrService.error('Login failed', err);
          this.isLoading = false;
        }
      });
    }
  }
  showPassword = false;
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}