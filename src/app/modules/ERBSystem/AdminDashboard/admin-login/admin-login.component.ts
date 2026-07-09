import { AuthService } from './../../../../core/services/Auth/auth.service';
import { Component, ElementRef, inject, ViewChild, viewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { RxReactiveFormsModule, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';

interface DemoAccount {
  label: string;
  role: string;
  email: string;
  password: string;
  icon: string;
}


const ROLE_ROUTES: Record<string, string> = {
  SystemAdmin: '/admin-dashboard',
  SalesManager: '/sales-analysis',
  WarehouseManager: '/warehouse-management',
  HRDirector: '/hr-dashboard',
};
@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RxReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  animations: [
    trigger('panelReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-26px) scale(0.98)' }),
        animate('560ms ease-out', style({ opacity: 1, transform: 'translateX(0) scale(1)' })),
      ]),
    ]),
    trigger('formReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        animate('460ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class AdminLoginComponent {
  private readonly _toastrService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  isLoading: boolean = false;

  @ViewChild('rememberMeinput') rememberMeinput!: ElementRef<HTMLInputElement>;

  loginform: FormGroup = this._formBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
    ]],
    confirmPassword: [null, RxwebValidators.compare({ fieldName: 'password' })],
    rememberMe: []
  });


  demoAccounts: DemoAccount[] = [
    { label: 'System Admin', role: 'SystemAdmin', email: 'ahmedhanygjki3556@gmail.com', password: 'Eslam1045@', icon: 'admin_panel_settings' },
    { label: 'Warehouse Manager', role: 'WarehouseManager', email: 'naribic615@fivejm.com', password: 'PD$jHT%qJ!d5', icon: 'warehouse' },
    { label: 'HR Director', role: 'HRDirector', email: 'omarsallam884@gmail.com', password: 'HRManger#21976', icon: 'groups' },
    { label: 'Sales Manager', role: 'SalesManager', email: 'yepego6870@jsncos.com', password: 'SalesManger#21976', icon: 'trending_up' },
  ];

  copiedField: string | null = null;

  copyToClipboard(text: string, fieldId: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedField = fieldId;
      setTimeout(() => (this.copiedField = null), 1500);
    });
  }

  fillDemoAccount(account: DemoAccount): void {
    this.loginform.patchValue({
      email: account.email,
      password: account.password,
      confirmPassword: account.password,
    });
    this._toastrService.info(`تم تعبئة بيانات حساب ${account.label}`, 'Demo Account');
  }

  LoginSubmit() {
    if (this.loginform.valid) {

      this.isLoading = true;

      this._authService.AdminLogin(this.loginform.value).subscribe({
        next: (res) => {

          this.isLoading = false;

          this._authService.saveAuthData(res);

          const role = res.roles[0];
          const route = ROLE_ROUTES[role];

          if (route) {
            this._router.navigate([route]);
            this._toastrService.success('Login successful', 'Success');
          } else {
            this._toastrService.error('Unauthorized role', 'Error');
          }
        },
        error: () => {
          this._toastrService.error('Login failed', 'Error');
          this.isLoading = false;
        }
      });
    }
  }

  showPassword = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}