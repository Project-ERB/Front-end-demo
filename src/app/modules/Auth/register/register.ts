import { Component, AfterViewInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { FlowbiteService } from '../../../core/services/Flowbite.Service';
import { initFlowbite } from 'flowbite';
import { MessageService } from 'primeng/api';
import { Authentecation } from '../../../core/services/authentecation.Service';
import { Iregister } from '../../../core/interface/register-data.interface';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, ToastModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements AfterViewInit {
  //todo  constructor injected with flowbite service and message service and auth service
  constructor(
    private flowbiteService: FlowbiteService,
    private messageService: MessageService,
    private authService: Authentecation
  ) {}

  ngAfterViewInit(): void {
    this.flowbiteService.loadFlowbite(() => {
      initFlowbite();
    });
  }

  //    todo form group and form controls with validators
  registerForm = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(20),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(50),
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^01[0125][0-9]{8}$/),
    ]),
    role: new FormControl('', [Validators.required]),
  });
  //      todo getters for form controls
  get userName() {
    return this.registerForm.get('userName');
  }
  get emailControl() {
    return this.registerForm.get('email');
  }
  get phoneControl() {
    return this.registerForm.get('phone');
  }
  get roleControl() {
    return this.registerForm.get('role');
  }

  // todo ngOninit

  register_from_ts(data: Iregister) {
    this.authService.register_user(data).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message || 'Registration successful',
        });
        console.log(this.registerForm.value);
        console.log(res);
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Registration failed',
        });
      },
    });
  }

  // method for handling form submission
  handleSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please check the required fields.',
      });
      return;
    }
    // todo  if form is valid , get form values and call register method
    const values = this.registerForm.value as Iregister;
    this.register_from_ts(values);
  }
}
