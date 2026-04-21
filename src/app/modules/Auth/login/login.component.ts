import { AuthService } from './../../../core/services/Auth/auth.service';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('logoReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-12px)' }),
        animate('420ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('cardReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px) scale(0.98)' }),
        animate('550ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
  ],
})
export class LoginComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _ToastrService = inject(ToastrService)

  isPasswordVisible: WritableSignal<boolean> = signal(false);
  isLoading: boolean = false;
  errorMessage: WritableSignal<string> = signal('');

  loginForm: FormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: [null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
    ]],
    confirmPassword: [null, RxwebValidators.compare({ fieldName: 'password' })],
  });

  togglePasswordVisibility(): void {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this._authService.AdminLogin({ email, password, confirmPassword: password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this._authService.saveAuthData(res);
        this._ToastrService.success('Login successful', 'Success');
        this._router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this._ToastrService.error('Login failed', 'Error');
      },
    });
  }

  ToRegister() {
    this._router.navigate(['/register']);
  }

  ToForgotPassword() {
    this._router.navigate(['/forget-password']);
  }
}