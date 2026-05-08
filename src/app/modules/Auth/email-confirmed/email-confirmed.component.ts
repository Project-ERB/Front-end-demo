import { Component, inject, signal, WritableSignal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/Auth/auth.service';

@Component({
  selector: 'app-email-confirmed',
  imports: [],
  templateUrl: './email-confirmed.component.html',
  styleUrl: './email-confirmed.component.scss'
})
export class EmailConfirmedComponent implements OnInit {
  private readonly _Router = inject(Router);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _AuthService = inject(AuthService);

  isVerified: WritableSignal<boolean> = signal(false);
  isLoading: WritableSignal<boolean> = signal(false);
  isError: WritableSignal<boolean> = signal(false);
  errorMessage: WritableSignal<string> = signal('');

  // These will be populated from query params (from email link)
  private token: string = '';
  private email: string = '';

  ngOnInit() {
    // Read token & email from query params (?token=xxx&email=yyy)
    this._ActivatedRoute.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';

      // If params exist → auto-call the API (user came from email link)
      if (this.token && this.email) {
        this.confirmEmail();
      }
    });
  }

  confirmEmail() {
    this.isLoading.set(true);
    this.isError.set(false);

    this._AuthService.ConfirmEmail(this.token, this.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isVerified.set(true);

        // Navigate to login after 3 seconds
        setTimeout(() => {
          this._Router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isError.set(true);
        this.errorMessage.set(
          err?.error?.message || 'Verification failed. The link may be expired or invalid.'
        );
      }
    });
  }
}