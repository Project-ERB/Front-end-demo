import { AuthService } from './../../../core/services/Auth/auth.service';
import { Component, ElementRef, inject, QueryList, signal, ViewChildren, WritableSignal } from '@angular/core';
import { FormBuilder, FormArray, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);

  // Steps: 1 = register form, 2 = OTP
  currentStep: WritableSignal<number> = signal(1);

  showPassword: WritableSignal<boolean> = signal(false);
  isLoading: WritableSignal<boolean> = signal(false);
  isResending: WritableSignal<boolean> = signal(false);
  errorMessages: WritableSignal<string[]> = signal([]);
  successMessage: WritableSignal<string> = signal('');
  resendCooldown: WritableSignal<number> = signal(0);
  private cooldownInterval: any;

  // Step 1 - Register Form
  registerForm: FormGroup = this._FormBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required]],
    password: [null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
    ]],
  });

  // Step 2 - OTP Form
  otpForm = new FormArray(
    Array(6).fill(0).map(() =>
      new FormControl('', [Validators.required, Validators.pattern('^[0-9]$')])
    )
  );

  get otpControls() {
    return this.otpForm.controls as FormControl[];
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  // ─── Step 1: Register ───────────────────────────────
  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessages.set([]);

    const { name, email, password, phoneNumber } = this.registerForm.value;

    this._authService.RegisterCustomer({ name, email, password, phoneNumber }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.currentStep.set(2);
        this.startResendCooldown();
      },
      error: (err) => {
        this.isLoading.set(false);
        if (Array.isArray(err?.error)) {
          this.errorMessages.set(err.error.map((e: any) => e.message));
        } else {
          this.errorMessages.set([err?.error?.message || 'Registration failed. Please try again.']);
        }
      },
    });
  }

  // ─── Step 2: OTP ────────────────────────────────────
  onInput(event: any, index: number) {
    const value = event.target.value;
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      digits.forEach((digit: string, i: number) => {
        if (this.otpForm.at(index + i)) {
          this.otpForm.at(index + i).setValue(digit);
        }
      });
      const nextIndex = Math.min(index + digits.length, 5);
      this.otpInputs.toArray()[nextIndex]?.nativeElement.focus();
      return;
    }
    if (value && index < 5) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpForm.at(index).value && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onVerify() {
    if (this.otpForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessages.set([]);

    const otp = Number(this.otpForm.value.join(''));
    const email = this.registerForm.value.email;

    this._authService.VerifyCustomerEmail({ otp, email }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessages.set([err?.error?.message || 'Invalid code. Please try again.']);
        this.otpForm.reset();
        this.otpInputs.toArray()[0]?.nativeElement.focus();
      },
    });
  }

  onResend() {
    if (this.resendCooldown() > 0 || this.isResending()) return;

    this.isResending.set(true);
    this.errorMessages.set([]);

    const email = this.registerForm.value.email;

    this._authService.ResendVerificationCode(email).subscribe({
      next: () => {
        this.isResending.set(false);
        this.successMessage.set('Code resent successfully!');
        this.startResendCooldown();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.isResending.set(false);
        this.errorMessages.set([err?.error?.message || 'Failed to resend code.']);
      },
    });
  }

  startResendCooldown(seconds = 60) {
    this.resendCooldown.set(seconds);
    clearInterval(this.cooldownInterval);
    this.cooldownInterval = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.resendCooldown.set(0);
        clearInterval(this.cooldownInterval);
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  goBackToRegister() {
    this.currentStep.set(1);
    this.otpForm.reset();
    this.errorMessages.set([]);
  }

  ToLogin() {
    this._router.navigate(['/login']);
  }

  ngOnDestroy() {
    clearInterval(this.cooldownInterval);
  }
}