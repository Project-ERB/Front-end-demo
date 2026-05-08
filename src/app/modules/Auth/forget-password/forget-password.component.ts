import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  isLoading: WritableSignal<boolean> = signal(false);
  showPassword: WritableSignal<boolean> = signal(false);

  email = localStorage.getItem('resetEmail');

  resetForm: FormGroup = this._fb.group({
    newPassword: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
      ]
    ],

    confirmPassword: [
      '',
      RxwebValidators.compare({ fieldName: 'newPassword' })
    ]
  });

  onResetPassword() {

    if (this.resetForm.valid) {

      this.isLoading.set(true);

      this._authService.ResetPassword({
        email: this.email,
        newPassword: this.resetForm.value.newPassword
      }).subscribe({

        next: () => {

          this._toastr.success('Password reset successfully!', 'Success');

          localStorage.removeItem('resetEmail');

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