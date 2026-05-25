import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ECommerceService } from '../../../core/services/e-commerce/e-commerce.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-e-commerce',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar-e-commerce.component.html',
  styleUrl: './navbar-e-commerce.component.scss',
})
export class NavbarECommerceComponent implements OnInit {

  private readonly _Router = inject(Router);
  private readonly _eCommerceService = inject(ECommerceService);
   @Output() searchChanged = new EventEmitter<string>();

  cartCount = 0;

  ngOnInit() {
    // اشترك الأول
    this._eCommerceService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    // ✅ حمّل الكارت وحدّث العداد
    this._eCommerceService.getCart().subscribe({
      next: (res) => {
        const total = res?.data?.cart?.items?.reduce(
          (sum: number, item: any) => sum + item.quantity, 0
        ) ?? 0;
        this._eCommerceService.updateCartCount(total);
      }
    });
  }

  onSearchChange(value: string) {
    this.searchChanged.emit(value);
  }
 
}
