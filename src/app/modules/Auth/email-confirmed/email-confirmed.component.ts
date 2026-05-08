import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-confirmed',
  imports: [],
  templateUrl: './email-confirmed.component.html',
  styleUrl: './email-confirmed.component.scss'
})
export class EmailConfirmedComponent {
  private readonly _Router = inject(Router)
  isVerified: WritableSignal<boolean> = signal(false);

  verifyEmail() {
    this.isVerified.set(true);

    setTimeout(() => {
      this._Router.navigate(['/login'])
    }, 3000);
  }

}