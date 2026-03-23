import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../app/core/services/Auth/auth.service';
import { RxwebValidators, RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget-password',
  imports: [ReactiveFormsModule, RxReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _toastr = inject(ToastrService);

  currentStep: WritableSignal<number> = signal(1);
  isLoading: WritableSignal<boolean> = signal(false);
  showPassword: WritableSignal<boolean> = signal(false);
  resetToken: string = '';

  //Sales#21976
  // Step 1
  emailForm: FormGroup = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  // Step 2
  otpForm: FormGroup = this._fb.group({
    otp: ['', [Validators.required]],
  });

  // Step 3
  resetForm: FormGroup = this._fb.group({
    newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)]],
    confirmPassword: ['', RxwebValidators.compare({ fieldName: 'newPassword' })]
  });

  // Step 1 — Send OTP
  onSendOtp() {
    if (this.emailForm.valid) {
      this.isLoading.set(true);
      this._authService.ForgotPassword(this.emailForm.value.email).subscribe({
        next: () => {
          this._toastr.success('OTP sent to your email!', 'Success');
          this.isLoading.set(false);
          this.currentStep.set(2);
        },
        error: (err) => {
          this._toastr.error('Email not found', 'Error');
          console.log(err);
          this.isLoading.set(false);
        }
      });
    }
  }

  // Step 2 — Verify OTP
  onVerifyOtp() {
    if (this.otpForm.valid) {
      this.isLoading.set(true);
      this._authService.VerifyResetOtp({
        otp: Number(this.otpForm.value.otp),
        email: this.emailForm.value.email
      }).subscribe({
        next: (res) => {
          this.resetToken = res.resetOTP;
          this._toastr.success('OTP verified!', 'Success');
          this.isLoading.set(false);
          this.currentStep.set(3);
        },
        error: (err) => {
          this._toastr.error('Invalid or expired OTP', 'Error');
          console.log(err);
          this.isLoading.set(false);
        }
      });
    }
  }

  // Step 3 — Reset Password
  onResetPassword() {
    if (this.resetForm.valid) {
      this.isLoading.set(true);
      this._authService.ResetPassword({
        resetToken: this.resetToken,
        newPassword: this.resetForm.value.newPassword
      }).subscribe({
        next: () => {
          this._toastr.success('Password reset successfully!', 'Success');
          this.isLoading.set(false);
          this._router.navigate(['/login']);
        },
        error: (err) => {
          this._toastr.error('Something went wrong', 'Error');
          console.log(err);
          this.isLoading.set(false);
        }
      });
    }
  }

  ToLogin() {
    this._router.navigate(['/login']);
  }
}