import { AuthService } from './../../../core/services/Auth/auth.service';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  animations: [
    trigger('heroReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px) scale(0.98)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateX(0) scale(1)' })),
      ]),
    ]),
  ],
})
export class RegisterComponent {
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _toastr = inject(ToastrService);

  showPassword: WritableSignal<boolean> = signal(false);
  isLoading: WritableSignal<boolean> = signal(false);

  // ✅ بديل لـ errorMessages: بيحمل شكل الريسبونس بالكامل (نجاح أو خطأ)
  apiResponse: WritableSignal<{
    type: 'success' | 'error';
    message: string;
    details?: string[];
  } | null> = signal(null);

  registerForm: FormGroup = this._FormBuilder.group({
    name: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]],
    phoneNumber: ['', [
      Validators.required,
      Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(100),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
    ]],
  });

  get nameErrors(): string {
    const control = this.registerForm.get('name');
    if (control?.errors && control?.touched) {
      if (control.errors['required']) return 'Name is required';
      if (control.errors['minlength']) return 'Name must be at least 3 characters';
      if (control.errors['maxlength']) return 'Name must not exceed 50 characters';
      if (control.errors['pattern']) return 'Name should contain letters only';
    }
    return '';
  }

  get emailErrors(): string {
    const control = this.registerForm.get('email');
    if (control?.errors && control?.touched) {
      if (control.errors['required']) return 'Email is required';
      if (control.errors['email'] || control.errors['pattern']) return 'Please enter a valid email';
    }
    return '';
  }

  get phoneErrors(): string {
    const control = this.registerForm.get('phoneNumber');
    if (control?.errors && control?.touched) {
      if (control.errors['required']) return 'Phone number is required';
      if (control.errors['pattern']) return 'Enter a valid Egyptian number (01xxxxxxxxx)';
    }
    return '';
  }

  get passwordErrors(): string {
    const control = this.registerForm.get('password');
    if (control?.errors && control?.touched) {
      if (control.errors['required']) return 'Password is required';
      if (control.errors['minlength']) return 'Password must be at least 8 characters';
      if (control.errors['pattern']) return 'Must include: uppercase, lowercase, number & special character';
    }
    return '';
  }

  hasMinLength(): boolean {
    return (this.registerForm.get('password')?.value || '').length >= 8;
  }
  hasUppercase(): boolean {
    return /[A-Z]/.test(this.registerForm.get('password')?.value || '');
  }
  hasLowercase(): boolean {
    return /[a-z]/.test(this.registerForm.get('password')?.value || '');
  }
  hasNumber(): boolean {
    return /\d/.test(this.registerForm.get('password')?.value || '');
  }
  hasSpecialChar(): boolean {
    return /[^a-zA-Z0-9]/.test(this.registerForm.get('password')?.value || '');
  }

  passwordStrength(): number {
    let strength = 0;
    if (this.hasMinLength()) strength += 20;
    if (this.hasUppercase()) strength += 20;
    if (this.hasLowercase()) strength += 20;
    if (this.hasNumber()) strength += 20;
    if (this.hasSpecialChar()) strength += 20;
    return strength;
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this._toastr.warning('Please fill all required fields correctly', 'Validation Error');
      return;
    }

    this.isLoading.set(true);
    this.apiResponse.set(null); // ريسيت قبل أي طلب جديد

    const { name, email, password, phoneNumber } = this.registerForm.value;

    this._authService.RegisterCustomer({ name, email, password, phoneNumber }).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const msg = response?.message || response?.data?.message || 'Account created! Check your email to verify.';
        this.apiResponse.set({ type: 'success', message: msg });
        this._toastr.success(msg, 'Welcome! 🎉');
        this._router.navigate(['/email-confirmed']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const errors: string[] = err?.error?.errors || [err?.error?.message || 'Registration failed.'];
        this.apiResponse.set({
          type: 'error',
          message: err?.error?.message || 'Registration failed.',
          details: errors,
        });
        this._toastr.error(errors[0] || 'Registration failed.', 'Error', { timeOut: 5000 });
      },
    });
  }

  ToLogin() {
    this._router.navigate(['/login']);
  }
}