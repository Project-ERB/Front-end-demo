// core/services/sidebar/sidebar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private _isOpen = new BehaviorSubject<boolean>(false);
  readonly isOpen$ = this._isOpen.asObservable();

  get isOpen(): boolean {
    return this._isOpen.value;
  }

  toggle(): void {
    this._isOpen.next(!this._isOpen.value);
  }

  open(): void {
    this._isOpen.next(true);
  }

  close(): void {
    this._isOpen.next(false);
  }
}