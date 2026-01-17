import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule,Validators } from '@angular/forms';
@Component({
  selector: 'app-otp',
  imports: [ReactiveFormsModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss',
})
export class OTPComponent {
  // Access all input elements for focus management
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef>;

  otpForm = new FormArray(
    Array(6)
      .fill(0)
      .map(
        () =>
          new FormControl('', [
            Validators.required,
            Validators.pattern('^[0-9]$'),
          ])
      )
  );

  get otpControls() {
    return this.otpForm.controls as FormControl[];
  }

  onInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    // Move to next field if value is entered
    if (value && index < 5) {
      this.inputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (
      event.key === 'Backspace' &&
      !this.otpForm.at(index).value &&
      index > 0
    ) {
      // Move to previous field on backspace if current is empty
      this.inputs.toArray()[index - 1].nativeElement.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.inputs.toArray()[index - 1].nativeElement.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.inputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onVerify() {
    if (this.otpForm.valid) {
      const otpCode = this.otpForm.value.join('');
      console.log('Verifying OTP:', otpCode);
      // Add your API call here
    }
  }
}
