//verify-email.component.ts
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../app/core/services/Auth/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

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
  private readonly _activatedRoute = inject(ActivatedRoute);

  isLoading: WritableSignal<boolean> = signal(false);

  verifyForm: FormGroup = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    token: ['', [Validators.required]],
  });

  ngOnInit() {
    this._activatedRoute.queryParams.subscribe(params => {
      if (params['token'] && params['email']) {
        this.verifyForm.patchValue({
          token: params['token'],
          email: params['email']
        });
        this.onVerifyEmail(); // ✅ بيتعمل verify تلقائي
      }
    });
  }

  onVerifyEmail() {
    if (this.verifyForm.valid) {

      this.isLoading.set(true);

      const { email, token } = this.verifyForm.value;

      this._authService.ConfirmEmail(token, email).subscribe({
        next: () => {

          this._toastr.success('Email verified successfully!', 'Success');

          this.isLoading.set(false);

          this._router.navigate(['/login']);
        },

        error: (err) => {
          this._toastr.error(err.error?.message || 'Verification failed', 'Error');
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