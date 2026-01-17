import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-forget-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent {
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _router = inject(Router);
  isSubmitting: WritableSignal<boolean> = signal(false);
  requestSent: WritableSignal<boolean> = signal(false);
  

  // constructor(private fb: FormBuilder) {
  forgotPasswordForm: FormGroup = this._FormBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });
  // }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isSubmitting.set(true);
      setTimeout(() => {
        console.log(
          'Reset link requested for:',
          this.forgotPasswordForm.value.email
        );
        this.isSubmitting.set( false);
        this.requestSent.set(true);
      }, 1500);
    }
  }
  ToLogin() {
    this._router.navigate(['/login']);
  }
}
