import { Component, inject, signal, WritableSignal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../app/core/services/Auth/auth.service';
import { RxwebValidators, RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ToastrService } from 'ngx-toastr';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  AnimationEvent
} from '@angular/animations';

@Component({
  selector: 'app-forget-password',
  imports: [ReactiveFormsModule, RxReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
  animations: [
    trigger('cardReveal', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(0.9) translateY(30px)'
        }),
        animate('500ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({
            opacity: 1,
            transform: 'scale(1) translateY(0)'
          })
        )
      ])
    ]),

    trigger('stepTransition', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate('400ms 200ms cubic-bezier(0.16, 1, 0.3, 1)', // 注意 الـ delay هنا
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ])
    ])
  ]
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