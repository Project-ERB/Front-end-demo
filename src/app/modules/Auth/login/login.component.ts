import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
loginForm: FormGroup;
  isPasswordVisible: boolean = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      console.log('Login Data:', this.loginForm.value);
      // Integrate your authentication service here
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
