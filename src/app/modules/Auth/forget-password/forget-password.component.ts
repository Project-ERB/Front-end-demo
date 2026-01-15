import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
@Component({
  selector: 'app-forget-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  requestSent = false;

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isSubmitting = true;

      // Simulate API Call
      setTimeout(() => {
        console.log(
          'Reset link requested for:',
          this.forgotPasswordForm.value.email
        );
        this.isSubmitting = false;
        this.requestSent = true;
      }, 1500);
    }
  }
}
