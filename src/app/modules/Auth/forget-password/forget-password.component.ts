import { Component, inject, signal, WritableSignal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../app/core/services/Auth/auth.service';
import { RxwebValidators, RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget-password',
  imports: [ReactiveFormsModule, RxReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent implements OnInit {

  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _toastr = inject(ToastrService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  isLoading: WritableSignal<boolean> = signal(false);
  showPassword: WritableSignal<boolean> = signal(false);

  // هنجيبهم من query params بدل localStorage
  private email: string = '';
  private token: string = '';

  resetForm: FormGroup = this._fb.group({
    newPassword: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
      ]
    ]
  });

  ngOnInit() {
    // الباكند بيبعت لينك زي:
    // yourapp.com/reset-password?email=xxx&token=yyy
    this._activatedRoute.queryParams.subscribe(params => {
      this.email = params['email'] || localStorage.getItem('resetEmail') || '';
      this.token = params['token'] || '';
    });
  }

  onResetPassword() {
    if (this.resetForm.invalid) return;

    this.isLoading.set(true);

    this._authService.VerifyPassword(
      this.email,
      this.token,
      this.resetForm.value.newPassword
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._toastr.success('Password reset successfully!', 'Success');
        localStorage.removeItem('resetEmail');
        this._router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this._toastr.error(err?.error?.message || 'Something went wrong', 'Error');
      }
    });
  }

  ToLogin() {
    this._router.navigate(['/login']);
  }
}