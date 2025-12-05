import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { FlowbiteService } from '../../../core/services/Flowbite.Service';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  constructor(private flowbiteService: FlowbiteService) {}

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }
  // todo  login form group
  login_Form: FormGroup = new FormGroup(
    {
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.minLength(5),
        Validators.maxLength(50),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.matching_passwords }
  );

  // todo    custom validator for password matching

  matching_passwords(group: AbstractControl): null | Record<string, boolean> {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { notMatching: true };
  }
  // todo  getter for form controls
  get emailControl() {
    return this.login_Form.get('email');
  }
  get passwordControl() {
    return this.login_Form.get('password');
  }
  get confirmPasswordControl() {
    return this.login_Form.get('confirmPassword');
  }

  submitLoginForm() {
    if (this.login_Form.invalid) {
      this.login_Form.markAllAsTouched();
      return;
    }
  }
}
