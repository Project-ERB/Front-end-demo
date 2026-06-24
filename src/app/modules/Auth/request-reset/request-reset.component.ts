import { Component, inject, signal, WritableSignal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../app/core/services/Auth/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-request-reset',
  imports: [ReactiveFormsModule],
  templateUrl: './request-reset.component.html',
  styleUrl: './request-reset.component.scss',
  animations: [
    trigger('cardReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.98)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
  ],
})
export class RequestResetComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _toastr = inject(ToastrService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  isLoading: WritableSignal<boolean> = signal(false);
  // isLinkSent مش هنعملها signal عشان هننتقل تاني على طول

  private userEmail: string = '';

  requestForm: FormGroup = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit() {
    this._activatedRoute.queryParams.subscribe(params => {
      this.userEmail = params['email'] || '';
      if (this.userEmail) {
        this.requestForm.patchValue({ email: this.userEmail });
      }
    });
  }

  onRequestLink() {
    if (this.requestForm.invalid) return;

    this.isLoading.set(true);
    const email = this.requestForm.value.email;

    this._authService.ForgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._toastr.success('If this email exists, a reset link has been sent.', 'Check Your Inbox 📧');

        // ✅ التعديل هنا: التوجيه لصفحة "تفقد إيميلك"
        this._router.navigate(['/email-confirmed']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this._toastr.error(err?.error?.message || 'Failed to send link.', 'Error');
      }
    });
  }

  ToLogin() {
    this._router.navigate(['/login']);
  }
}