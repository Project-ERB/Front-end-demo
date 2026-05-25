import { ECommerceService, CreateOrderPayload } from './../../../core/services/e-commerce/e-commerce.service';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarECommerceComponent } from "../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";
import { ToastrService } from 'ngx-toastr';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { ECommerceSidebarComponent } from "../../../shared/UI/e-commerce-sidebar/e-commerce-sidebar.component";

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
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NavbarECommerceComponent, ECommerceSidebarComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        animate('420ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('cartStagger', [
      transition('* => *', [
        query(
          '.cart-row',
          [
            style({ opacity: 0, transform: 'translateY(14px) scale(0.98)' }),
            stagger(70, [animate('320ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('modalPop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.96) translateY(10px)' }),
        animate('260ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'scale(0.97) translateY(8px)' })),
      ]),
    ]),
  ],
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
isMobileSidebarOpen = false;
  pendingQuantities = signal<Map<string, number>>(new Map());
  savingItems = signal<Set<string>>(new Set());

  paymentMethods = [
    { label: 'Cash',   value: PaymentMethod.Cash,   icon: 'payments' },
    { label: 'Card',   value: PaymentMethod.Card,   icon: 'credit_card' },
    { label: 'Wallet', value: PaymentMethod.Wallet, icon: 'account_balance_wallet' },
    { label: 'Kiosk',  value: PaymentMethod.Kiosk,  icon: 'point_of_sale' },
  ];

  checkoutForm: FormGroup = this._fb.group({
    method: [null, Validators.required],
    shipping: [false],
    shippingAddress: [''],
  });

  get subtotal()    { return this.cart()?.subTotal ?? 0; }
  get shippingCost(){ return this.cart()?.shippingCost ?? 0; }
  get estimatedTax(){ return this.cart()?.totalTaxAmount ?? 0; }
  get total()       { return this.cart()?.grandTotal ?? 0; }
  get totalItems()  { return this.cartItems().reduce((sum, item) => sum + item.quantity, 0); }
  get needsAddress(){ return this.checkoutForm.get('shipping')?.value === true; }

  ngOnInit() {
    this.loadCart();
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
  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getDisplayQuantity(item: CartItem): number {
    return this.pendingQuantities().get(item.id) ?? item.quantity;
  }

  isSaving(itemId: string): boolean {
    return this.savingItems().has(itemId);
  }

  hasPendingChange(item: CartItem): boolean {
    const pending = this.pendingQuantities().get(item.id);
    return pending !== undefined && pending !== item.quantity;
  }

  onQuantityFocusOut(event: FocusEvent, item: CartItem) {
    const wrapper = event.currentTarget as HTMLElement;
    const newFocus = event.relatedTarget as Node | null;
    // لو المستخدم بس اتنقل من + لـ - أو العكس، متبعتش
    if (newFocus && wrapper.contains(newFocus)) return;
    this.commitQuantityUpdate(item);
  }

  // ─── Quantity Logic ──────────────────────────────────────────────────────────

  increaseQuantity(item: CartItem) {
    const current = this.getDisplayQuantity(item);
    this.pendingQuantities.update(map => new Map(map).set(item.id, current + 1));
  }

  decreaseQuantity(item: CartItem) {
    const current = this.getDisplayQuantity(item);
    if (current <= 1) return;
    this.pendingQuantities.update(map => new Map(map).set(item.id, current - 1));
  }

  commitQuantityUpdate(item: CartItem) {
    const pending = this.pendingQuantities().get(item.id);
    if (pending === undefined || pending === item.quantity) return;

    this.savingItems.update(set => new Set([...set, item.id]));

    this._eCommerceService.updateQuantity(item.id, pending).subscribe({
      next: () => {
        this.savingItems.update(set => { const s = new Set(set); s.delete(item.id); return s; });
        this.pendingQuantities.update(map => { const m = new Map(map); m.delete(item.id); return m; });
        this.loadCart();
        this._toastr.success('Quantity updated.');
      },
      error: () => {
        // Rollback
        this.savingItems.update(set => { const s = new Set(set); s.delete(item.id); return s; });
        this.pendingQuantities.update(map => { const m = new Map(map); m.delete(item.id); return m; });
        this._toastr.error('Failed to update quantity.');
      }
    });
  }

  // ─── Cart Operations ─────────────────────────────────────────────────────────

  loadCart() {
    this.isLoading.set(true);
    this._eCommerceService.getCart().subscribe({
      next: (res) => {
        this.cart.set(res.data.cart);
        const loadedIds = new Set(res.data.cart?.items?.map((i: CartItem) => i.id) ?? []);
        this.pendingQuantities.update(map => {
          const m = new Map(map);
          loadedIds.forEach(id => m.delete(id as string));
          return m;
        });
        const total = res.data.cart?.items?.reduce(
          (sum: number, item: any) => sum + item.quantity, 0
        ) ?? 0;
        this._eCommerceService.updateCartCount(total);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load cart.');
        this.isLoading.set(false);
      }
    });
  }

  removeItem(itemId: string) {
    this.pendingQuantities.update(map => { const m = new Map(map); m.delete(itemId); return m; });
    this._eCommerceService.removeCartItem(itemId).subscribe({
      next: () => { 
        this.loadCart(); 
        this._toastr.success('Item removed from cart.'); },
      error: () => this._toastr.error('Failed to remove item from cart.')
    });
  }

  proceedToCheckout() {
    this.checkoutForm.reset({ method: null, shipping: false, shippingAddress: '' });
    this.showCheckoutModal.set(true);
  }

  closeCheckoutModal() { this.showCheckoutModal.set(false); }

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
      next: (res) => {
        this.isSubmittingOrder.set(false);
        this.showCheckoutModal.set(false);
        this._toastr.success('Order placed successfully!');
        const paymentUrl = res?.data?.value;
        if (paymentUrl) { window.location.href = paymentUrl; } else { this.loadCart(); }
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