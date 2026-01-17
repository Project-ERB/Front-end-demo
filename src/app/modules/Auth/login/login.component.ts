import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  isPasswordVisible: WritableSignal<boolean> = signal(false);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _router = inject(Router);

  loginForm: FormGroup = this._formBuilder.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  togglePasswordVisibility(): void {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      console.log('Login Data:', this.loginForm.value);
      
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
  ToRegister() {
    this._router.navigate(['/register']);
  }
}
