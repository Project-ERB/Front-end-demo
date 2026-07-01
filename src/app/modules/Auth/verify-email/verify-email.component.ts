import { Component, inject, signal, WritableSignal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
export class VerifyEmailComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _toastr = inject(ToastrService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  isLoading: WritableSignal<boolean> = signal(false);
  emailMismatch: WritableSignal<boolean> = signal(false);

  // ✅ نفس النمط هنا كمان
  apiResponse: WritableSignal<{
    type: 'success' | 'error';
    message: string;
    details?: string[];
  } | null> = signal(null);

  private urlToken: string = '';
  private urlEmail: string = '';

  verifyForm: FormGroup = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit() {
    this._activatedRoute.queryParams.subscribe(params => {
      this.urlEmail = params['email'] || '';
      this.urlToken = params['token'] || '';

      if (!this.urlToken) {
        this._toastr.error('Invalid or expired verification link.', 'Error');
      }
    });
  }

  onVerifyEmail() {
    const enteredEmail = this.verifyForm.value.email;

    if (this.verifyForm.invalid) {
      this._toastr.warning('Please enter a valid email address.', 'Warning');
      return;
    }

    if (enteredEmail.toLowerCase() !== this.urlEmail.toLowerCase()) {
      this.emailMismatch.set(true);
      this.apiResponse.set({
        type: 'error',
        message: 'This email does not match the account we are verifying.',
      });
      this._toastr.error('This email does not match the account we are verifying.', 'Mismatch');
      return;
    }

    this.emailMismatch.set(false);
    this.isLoading.set(true);
    this.apiResponse.set(null);

    this._authService.ConfirmEmail(this.urlToken, enteredEmail).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        const msg = res?.message || 'Email verified successfully!';
        this.apiResponse.set({ type: 'success', message: msg });
        this._toastr.success(msg, 'Account Ready ✅');
        this._router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const errors: string[] = err?.error?.errors || [err?.error?.message || 'Verification failed. The link may have expired.'];
        this.apiResponse.set({
          type: 'error',
          message: err?.error?.message || 'Verification failed. The link may have expired.',
          details: errors,
        });
        this._toastr.error(errors[0], 'Error');
      }
    });
  }

  ToLogin() {
    this._router.navigate(['/login']);
  }
}