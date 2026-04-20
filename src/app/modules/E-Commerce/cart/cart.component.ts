import { ECommerceService, CreateOrderPayload } from './../../../core/services/e-commerce/e-commerce.service';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarECommerceComponent } from "../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";
import { ToastrService } from 'ngx-toastr';

export enum PaymentMethod {
  Cash = 1,
  Card = 2,
  Wallet = 3,
  Kiosk = 4
}

interface CartItem {
  id: string;
  sku: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
  taxRate: number;
  productId: string;
  variantId: string;
}

interface Cart {
  id: string;
  subTotal: number;
  totalTaxAmount: number;
  shippingCost: number;
  grandTotal: number;
  items: CartItem[];
}

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NavbarECommerceComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly _eCommerceService = inject(ECommerceService);
  private readonly _toastr = inject(ToastrService);
  private readonly _fb = inject(FormBuilder);

  cart = signal<Cart | null>(null);
  cartItems = computed(() => this.cart()?.items ?? []);
  isLoading = signal(true);
  errorMessage = signal('');
  showCheckoutModal = signal(false);
  isSubmittingOrder = signal(false);

  // Payment methods للعرض في الـ modal
  paymentMethods = [
    { label: 'Cash', value: PaymentMethod.Cash, icon: 'payments' },
    { label: 'Card', value: PaymentMethod.Card, icon: 'credit_card' },
    { label: 'Wallet', value: PaymentMethod.Wallet, icon: 'account_balance_wallet' },
    { label: 'Kiosk', value: PaymentMethod.Kiosk, icon: 'point_of_sale' },
  ];

  checkoutForm: FormGroup = this._fb.group({
    method: [null, Validators.required],
    shipping: [false],
    shippingAddress: [''],
  });

  get subtotal() { return this.cart()?.subTotal ?? 0; }
  get shippingCost() { return this.cart()?.shippingCost ?? 0; }
  get estimatedTax() { return this.cart()?.totalTaxAmount ?? 0; }
  get total() { return this.cart()?.grandTotal ?? 0; }
  get totalItems() { return this.cartItems().reduce((sum, item) => sum + item.quantity, 0); }
  get needsAddress() { return this.checkoutForm.get('shipping')?.value === true; }

  ngOnInit() {
    this.loadCart();

    // إذا اختار shipping = true يبقى الـ address مطلوب
    this.checkoutForm.get('shipping')?.valueChanges.subscribe(val => {
      const addressControl = this.checkoutForm.get('shippingAddress');
      if (val) {
        addressControl?.setValidators(Validators.required);
      } else {
        addressControl?.clearValidators();
        addressControl?.setValue('');
      }
      addressControl?.updateValueAndValidity();
    });
  }

  loadCart() {
    this.isLoading.set(true);
    this._eCommerceService.getCart().subscribe({
      next: (res) => {
        this.cart.set(res.data.cart);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load cart.');
        this.isLoading.set(false);
      }
    });
  }

  increaseQuantity(item: CartItem) {
    this._eCommerceService.updateQuantity(item.id, item.quantity + 1).subscribe({
      next: () => { this.loadCart(); this._toastr.success('Quantity updated.'); },
      error: () => this._toastr.error('Failed to update quantity.')
    });
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity <= 1) return;
    this._eCommerceService.updateQuantity(item.id, item.quantity - 1).subscribe({
      next: () => { this.loadCart(); this._toastr.success('Quantity updated.'); },
      error: () => this._toastr.error('Failed to update quantity.')
    });
  }

  removeItem(itemId: string) {
    this._eCommerceService.removeCartItem(itemId).subscribe({
      next: () => { this.loadCart(); this._toastr.success('Item removed from cart.'); },
      error: () => this._toastr.error('Failed to remove item from cart.')
    });
  }

  proceedToCheckout() {
    this.checkoutForm.reset({ method: null, shipping: false, shippingAddress: '' });
    this.showCheckoutModal.set(true);
  }

  closeCheckoutModal() {
    this.showCheckoutModal.set(false);
  }

  submitOrder() {
    if (this.checkoutForm.invalid || !this.cart()) return;

    this.isSubmittingOrder.set(true);

    const payload: CreateOrderPayload = {
      cartId: this.cart()!.id,
      method: this.checkoutForm.value.method,
      shipping: this.checkoutForm.value.shipping,
      shippingAddress: this.checkoutForm.value.shippingAddress ?? '',
    };

    this._eCommerceService.createOrder(payload).subscribe({
      next: () => {
        this.isSubmittingOrder.set(false);
        this.showCheckoutModal.set(false);
        this._toastr.success('Order placed successfully!');
        this.loadCart();
      },
      error: (err) => {
        this.isSubmittingOrder.set(false);
        this._toastr.error(err?.error?.message || 'Failed to place order.');
      }
    });
  }

  applyPromoCode() { }
  expressCheckout() { }
}