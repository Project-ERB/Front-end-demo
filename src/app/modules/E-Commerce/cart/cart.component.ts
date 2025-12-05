import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarECommerceComponent } from "../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";

interface CartItem {
  id: number;
  name: string;
  imageUrl: string;
  attributes: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, FormsModule, NavbarECommerceComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  cartItems = signal<CartItem[]>([
    {
      id: 1,
      name: 'Classic Leather Watch',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      attributes: 'Color: Brown | Strap: Leather',
      price: 199.99,
      quantity: 1
    },
    {
      id: 2,
      name: 'Modern Bluetooth Speaker',
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
      attributes: 'Color: Charcoal Black',
      price: 89.50,
      quantity: 1
    },
    {
      id: 3,
      name: 'Ergonomic Office Chair',
      imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
      attributes: 'Color: Grey',
      price: 226.00,
      quantity: 1
    }
  ]);

  promoCode = signal('');
  shippingCost = 5.00;
  estimatedTax = 42.12; // Fixed tax amount as per design

  get subtotal() {
    return this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get total() {
    return this.subtotal + this.shippingCost + this.estimatedTax;
  }

  get totalItems() {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  increaseQuantity(item: CartItem) {
    this.cartItems.update(items => 
      items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
    );
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartItems.update(items => 
        items.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)
      );
    }
  }

  removeItem(itemId: number) {
    this.cartItems.update(items => items.filter(item => item.id !== itemId));
  }

  applyPromoCode() {
    // TODO: Implement promo code logic
    console.log('Applying promo code:', this.promoCode());
  }

  proceedToCheckout() {
    // TODO: Navigate to checkout page
    console.log('Proceeding to checkout');
  }

  expressCheckout() {
    // TODO: Implement express checkout
    console.log('Express checkout');
  }
}
