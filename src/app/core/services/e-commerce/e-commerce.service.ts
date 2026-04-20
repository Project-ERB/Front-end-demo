import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Environment } from '../../../shared/UI/environment/env';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface AddToCartPayload {
  sku: string;
  quantity: number;
}

export interface CreateOrderPayload {
  cartId: string;
  method: number;
  shipping: boolean;
  shippingAddress: string;
}

@Injectable({
  providedIn: 'root',
})
export class ECommerceService {

  private readonly _HttpClient = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getCart(): Observable<any> {
    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/graphql`,
      {
        query: `
        query {
          cart {
            id
            userId
            status
            subTotal
            totalTaxAmount
            shippingCost
            grandTotal
            createdAt
            lastModifiedAt
            items {
              id
              taxAmount
              productId
              variantId
              sku
              productName
              productImageUrl
              quantity
              unitPrice
              taxRate
              totalPrice
            }
          }
        }
      `
      }
    );
  }

  getCustomerProfile(): Observable<any> {
    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/graphql`,
      {
        query: `
        query {
          customers{
            nodes{
              id
              name
              phone
              isActive
              creditLimitAmount
              currency
            }
          }
        }
      `
      }
    );
  }


  addToCart(payload: AddToCartPayload): Observable<any> {
    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/api/carts`,
      payload,
    );
  }

  updateQuantity(cartItemId: string, newQuantity: number): Observable<any> {
    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/api/carts/update-quantity/${cartItemId}`,
      { newQuantity }  // ✅ newQuantity مش quantity
    );
  }

  removeCartItem(cartItemId: string): Observable<any> {
    return this._HttpClient.delete<any>(
      `${Environment.baseUrl}/api/carts/remove-item/${cartItemId}`
    );
  }

  createOrder(payload: CreateOrderPayload): Observable<any> {
    return this._HttpClient.post<any>(
      `${Environment.baseUrl}/api/SalesOrder/New`,
      payload
    );
  }

}

