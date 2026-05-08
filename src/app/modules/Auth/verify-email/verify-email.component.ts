import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../app/core/services/Auth/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-verify-email',
  imports: [ReactiveFormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  animations: [
    trigger('cardReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.98)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
  ],
})
export class VerifyEmailComponent {

  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _toastr = inject(ToastrService);

  isLoading: WritableSignal<boolean> = signal(false);

  verifyForm: FormGroup = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onVerifyEmail() {
    if (this.verifyForm.invalid) return;

    this.isLoading.set(true);

    const { email } = this.verifyForm.value;

    this._authService.ForgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._toastr.success('Reset link sent to your email!', 'Success');
        this._router.navigate(['/reset-password']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this._toastr.error(err.error?.message || 'Something went wrong', 'Error');
      }
    });
  }

  ToLogin() {
    this._router.navigate(['/login']);
  }
}