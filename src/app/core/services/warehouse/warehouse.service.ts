import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Environment } from '../../../shared/UI/environment/env';
import { isPlatformBrowser } from '@angular/common';

export interface TransferPayload {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  productId: string;
  sku: string;
  qty: number;
  reference: string;
}

export interface TransferResponse {
  [key: string]: unknown;
}

export interface WarehouseProduct {
  productId: string; sku: string; name: string; imageUrl: string;
  availableStock: number; qtyToTransfer: number;
  sellingPrice: number; currency: string; code: string;
}

export interface WarehouseOption {
  value: string;
  guid: string;
  label: string;
}

export interface AddWarehouseRequest {
  name: string; street: string; city: string;
  state: string; postalCode: string; country: string; type: number;
}

export interface StockInPayload {
  productId: string;
  sku: string;
  qty: number;
  refrence: string;
}

export interface DecreaseStockPayload {
  inventoryId: string;
  quantityToDecrease: number;
  reference: string;
}

export interface AdjustPayload {
  productSku: string;
  type: number;
  quntity: number;
  reason: string;
}

export interface WarehouseNode {
  id: string;
  name: string;
  managerName: string;
  street: string;
  city: string;
  country: string;
  type: string;
  status: string;
}

export interface StockMovementNode {
  id: string;
  warehouseName: string;
  productName: string;
  sku: string;
  movementType: string;
  quantity: number;
  unitCost: number;
  currency: string;
  reference: string;
  movementDate: string;
}

export interface InventoryNode {
  id: string;
  productName: string;
  productId: string;
  sku: string;
  warehouseName: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  averageCost: number;
  currency: string;
  lastStockDate: string;
}

// ✅ NEW: AdjustmentNode interface
export interface AdjustmentNode {
  id: string;
  productName: string;
  sku: string;
  adjustmentType: string;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
  reason: string;
  adjustmentDate: string;
}

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly platformId = inject(PLATFORM_ID);
  constructor(private http: HttpClient) { }

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  addWarehouse(data: AddWarehouseRequest): Observable<any> {
    return this.http.post<any>(
      `${Environment.baseUrl}/api/Warehouses`,
      data,
      { headers: this.getHeaders() }
    );
  }

  stockIn(warehouseId: string, body: StockInPayload): Observable<any> {
    return this.http.post<any>(
      `${Environment.baseUrl}/api/Warehouses/StockIn/${warehouseId}`,
      body,
      { headers: this.getHeaders() }
    );
  }

  decreaseStock(warehouseId: string, body: DecreaseStockPayload): Observable<any> {
    return this.http.post<any>(
      `${Environment.baseUrl}/api/Warehouses/decrease/${warehouseId}`,
      body,
      { headers: this.getHeaders() }
    );
  }

  adjustStock(warehouseId: string, body: AdjustPayload): Observable<any> {
    return this.http.post<any>(
      `${Environment.baseUrl}/api/Warehouses/Adjust/${warehouseId}`,
      body,
      { headers: this.getHeaders() }
    );
  }

  transferProduct(payload: TransferPayload): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(
      `${Environment.baseUrl}/api/Warehouses/Transfer`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  transferProducts(payloads: TransferPayload[]): Observable<TransferResponse[]> {
    return forkJoin(payloads.map(p => this.transferProduct(p)));
  }

  updateWarehouse(id: string, data: AddWarehouseRequest): Observable<any> {
    return this.http.put<any>(
      `${Environment.baseUrl}/api/Warehouses/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getWarehouses(): Observable<WarehouseNode[]> {
    const body = {
      query: `
      query {
        warehouses {
          nodes {
            id name managerName street city country type status
          }
        }
      }`,
    };
    return this.http
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders() })
      .pipe(map((res) => res?.data?.warehouses?.nodes ?? []));
  }

  getStockMovements(): Observable<StockMovementNode[]> {
    const body = {
      query: `
      query {
        stockMovements {
          nodes {
            id warehouseName productName sku movementType
            quantity unitCost currency reference movementDate
          }
        }
      }`,
    };
    return this.http
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders() })
      .pipe(map((res) => res?.data?.stockMovements?.nodes ?? []));
  }

  getInventories(): Observable<InventoryNode[]> {
    const body = {
      query: `
    query {
      inventories {
        nodes {
          id  productName sku warehouseName
          quantityOnHand quantityReserved quantityAvailable
          averageCost currency lastStockDate
        }
      }
    }`,
    };
    return this.http
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders() })
      .pipe(map((res) => res?.data?.inventories?.nodes ?? []));
  }

  getProducts(): Observable<WarehouseProduct[]> {
    const body = {
      query: `
        query {
          products {
            nodes {
              id name code imageUrl sellingPrice currency baseBarcode
              variants { sku barcode }
            }
          }
        }`,
    };
    return this.http.post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders() }).pipe(
      map((res) =>
        (res?.data?.products?.nodes ?? []).map((p: any) => ({
          productId: p.id,
          sku: p.variants?.[0]?.sku ?? p.baseBarcode ?? p.code,
          name: p.name,
          imageUrl: p.imageUrl ?? '',
          availableStock: 0,
          qtyToTransfer: 0,
          sellingPrice: p.sellingPrice ?? 0,
          currency: p.currency ?? '',
          code: p.code,
        }))
      )
    );
  }

  // ✅ NEW: getAdjustments
  getAdjustments(): Observable<StockMovementNode[]> {
    const body = {
      query: `
    query {
      stockMovements(where: {
        movementType: {
          eq: "Adjustment"
        }
      }) {
        nodes {
          id warehouseName productName sku movementType
          quantity unitCost currency reference movementDate
        }
      }
    }`,
    };
    return this.http
      .post<any>(`${Environment.baseUrl}/graphql`, body, { headers: this.getHeaders() })
      .pipe(map((res) => res?.data?.stockMovements?.nodes ?? []));
  }
}