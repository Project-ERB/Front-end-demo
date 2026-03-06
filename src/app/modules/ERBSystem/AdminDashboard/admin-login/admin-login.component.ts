import { Component, ElementRef, inject, ViewChild, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { RxReactiveFormsModule, RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthService } from '../../../../core/services/Auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RxReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {

  private readonly _toastrService = inject(ToastrService);
  isLoading: boolean = false;

  private readonly _formBuilder = inject(FormBuilder)

  private readonly _authService = inject(AuthService);

  private readonly _router = inject(Router);

  @ViewChild('rememberMeinput') rememberMeinput!: ElementRef<HTMLInputElement>;

  loginform: FormGroup = this._formBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/)]],
    confirmPassword: [null, RxwebValidators.compare({ fieldName: 'password' })],
    rememberMe: []
  })

  LoginSubmit() {
    if (this.loginform.valid) {
      this.isLoading = true;
      this._authService.AdminLogin(this.loginform.value).subscribe({
        next: (res) => {
          this._toastrService.success('Login successful', 'Success');
          this.isLoading = false;
          console.log(res);
          //store token in local storage
          this._authService.accessToken.set(res.accessToken);
          //store token in local storage
          localStorage.setItem('refreshToken', res.refreshToken);
          //set remember me checkbox value in local storage
          // if (this.rememberMeinput.nativeElement.checked) {
          //   localStorage.setItem('accessToken', res.accessToken);
          // }
          localStorage.setItem('accessToken', res.accessToken);
          //بكرا لما اصحي هعمل install  ل التوستر و اعمل توست هنا
          setTimeout(() => {
            //navigate to admin dashboard
            this._router.navigate(['/sales-analysis']);
          }, 2000);
        },
        error: (err) => {
          this._toastrService.error('Login failed', 'Error');
          console.log(err);
          this.isLoading = false;
        }
      })
    }

  }

  showPassword = false;


  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
