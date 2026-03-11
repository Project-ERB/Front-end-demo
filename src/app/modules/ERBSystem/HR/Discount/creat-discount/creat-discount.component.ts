import { CategoriesService } from './../../../../../core/services/categories/categories.service';
import { ProductService } from './../../../../../core/services/products/product.service';
import { CreateDiscountPayload, DiscountService } from './../../../../../core/services/Discount/discount.service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebaSalesComponent } from "../../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";
import { map } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export type DiscountType = 'percentage' | 'fixed' | 'bxgy';
export type TargetingOption = 'store' | 'category' | 'product' | 'customer';

export interface DiscountTypeOption {
  value: DiscountType; label: string; description: string; icon: string; apiValue: number;
}
export interface Step { number: number; label: string; fieldHint: string; }
export interface RecentUser { initials: string; name: string; time: string; bg: string; color: string; }
export interface EditHistoryEntry { date: string; title: string; detail: string; current: boolean; }

export interface TargetIdOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-creat-discount',
  imports: [CommonModule, FormsModule, SidebaSalesComponent],
  templateUrl: './creat-discount.component.html',
  styleUrl: './creat-discount.component.scss',
})
export class CreatDiscountComponent implements OnInit {

  private readonly _DiscountService = inject(DiscountService);
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _ProductService = inject(ProductService);
  private readonly _Router = inject(Router);
  private readonly _Toastr = inject(ToastrService); // ✅

  isLoading = false;
  isEditMode = false;

  // ─── Stepper ────────────────────────────────────────────────────────────────
  steps: Step[] = [
    { number: 1, label: 'Identity & Type', fieldHint: 'code · name · description · discountType · discountValueAmount' },
    { number: 2, label: 'Schedule & Targeting', fieldHint: 'startDate · endDate · currency · tagetType · targetId · minimumPurchaseAmount' },
    { number: 3, label: 'Limits & Rules', fieldHint: 'minimumQuantity · maximumDiscountAmount · totalUsageLimit · usageLimitPerCustomer · canCombine' },
    { number: 4, label: 'Review & Publish', fieldHint: 'All 16 API fields' },
  ];
  currentStep = 1;

  // ─── Step 1 ──────────────────────────────────────────────────────────────────
  discountCode = '';
  discountName = '';
  discountDescription = '';

  typeOptions: DiscountTypeOption[] = [
    { value: 'percentage', label: 'Percentage', description: 'A % off the entire order', icon: 'percent', apiValue: 0 },
    { value: 'fixed', label: 'Fixed Amount', description: 'A fixed $ amount off the total', icon: 'attach_money', apiValue: 1 },
    { value: 'bxgy', label: 'Buy X Get Y', description: 'Discount specific product pairs', icon: 'redeem', apiValue: 2 },
  ];
  selectedType: DiscountType = 'percentage';
  discountValue: number | null = null;

  buyQuantity = 0;
  getQuantity = 0;
  getDiscountPercentage = 0;

  get valueLabel(): string {
    return this.selectedType === 'percentage' ? 'Percentage' :
      this.selectedType === 'fixed' ? 'Discount Value ($)' : 'Get Discount (%)';
  }
  get valueSuffix(): string { return this.selectedType === 'fixed' ? '$' : '%'; }
  get valuePlaceholder(): string { return this.selectedType === 'fixed' ? '10.00' : '15'; }

  generateCode(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    this.discountCode = Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  // ─── Step 2 ──────────────────────────────────────────────────────────────────
  startDate = '';
  endDate = '';
  currency = 'USD';
  targeting: TargetingOption = 'store';
  targetId = '00000000-0000-0000-0000-000000000000';
  minPurchase: number | null = null;

  targetingOptions: Array<{ value: TargetingOption; label: string; description: string; apiValue: number }> = [
    { value: 'store', label: 'Entire Store', description: 'Valid for all products in the catalog.', apiValue: 0 },
    { value: 'category', label: 'Category', description: 'Limit discount to a specific category.', apiValue: 1 },
    { value: 'product', label: 'Product', description: 'Limit discount to a specific product.', apiValue: 2 },
    { value: 'customer', label: 'Customer', description: 'Limit discount to a specific customer.', apiValue: 3 },
  ];

  targetIdOptions: TargetIdOption[] = [];
  isLoadingTargetIds = false;
  targetIdError = '';

  onTargetTypeChange(value: TargetingOption): void {
    this.targeting = value;
    this.targetId = '00000000-0000-0000-0000-000000000000';
    this.targetIdOptions = [];
    this.targetIdError = '';

    if (value === 'store') return;

    this.isLoadingTargetIds = true;

    if (value === 'category') {
      this._CategoriesService.getCategories().subscribe({
        next: (nodes: any[]) => {
          this.targetIdOptions = nodes.map((c: any) => ({
            id: c.id,
            label: c.name || c.code || c.id
          }));
          if (this.targetIdOptions.length === 0) this.targetIdError = 'No categories found.';
          this.isLoadingTargetIds = false;
        },
        error: () => {
          this.targetIdError = 'Failed to load categories.';
          this.isLoadingTargetIds = false;
        }
      });
    } else if (value === 'product') {
      this._ProductService.getProducts()
        .pipe(map((res: any) => res?.data?.products?.nodes ?? []))
        .subscribe({
          next: (nodes: any[]) => {
            this.targetIdOptions = nodes.map(p => ({
              id: p.id,
              label: p.name || p.code || p.id
            }));
            if (this.targetIdOptions.length === 0) this.targetIdError = 'No products found.';
            this.isLoadingTargetIds = false;
          },
          error: () => {
            this.targetIdError = 'Failed to load products.';
            this.isLoadingTargetIds = false;
          }
        });
    } else if (value === 'customer') {
      this.targetIdError = 'Customer service not connected yet.';
      this.isLoadingTargetIds = false;
    }
  }

  // ─── Step 3 ──────────────────────────────────────────────────────────────────
  minimumQuantity: number | null = null;
  maximumDiscountAmount: number | null = null;
  usageLimit: number | null = null;
  usageLimitPerCustomer: number | null = null;
  allowCombine = false;

  // ─── Step 4 ──────────────────────────────────────────────────────────────────
  publishNotify = true;
  publishAnalytics = false;

  // ─── Maps ────────────────────────────────────────────────────────────────────
  readonly discountTypeMap: Record<DiscountType, number> = {
    percentage: 0, fixed: 1, bxgy: 2,
  };
  private readonly targetingTypeMap: Record<TargetingOption, number> = {
    store: 0, category: 1, product: 2, customer: 3,
  };

  // ─── Summary getters ─────────────────────────────────────────────────────────
  get summaryCode(): string { return this.discountCode || '--'; }
  get summaryTitle(): string { return this.discountName || 'New Discount'; }
  get summaryTypeLabel(): string { return this.typeOptions.find(t => t.value === this.selectedType)?.label ?? ''; }
  get summaryValueLine(): string {
    if (this.discountValue === null) return '';
    return this.selectedType === 'fixed'
      ? '$' + Number(this.discountValue).toFixed(2) + ' Off'
      : this.discountValue + '% Off';
  }
  get selectedTargetLabel(): string {
    if (this.targeting === 'store') return 'Entire Store';
    const found = this.targetIdOptions.find(o => o.id === this.targetId);
    return found ? found.label : this.targetId;
  }
  get completedFields(): number {
    let count = 0;
    if (this.discountCode) count++;
    if (this.discountName) count++;
    if (this.discountDescription) count++;
    count++;
    if (this.discountValue !== null || this.selectedType === 'bxgy') count++;
    if (this.startDate) count++;
    if (this.endDate) count++;
    count++;
    count++;
    if (this.targeting === 'store' || this.targetId !== '00000000-0000-0000-0000-000000000000') count++;
    if (this.minPurchase !== null) count++;
    if (this.minimumQuantity !== null) count++;
    if (this.maximumDiscountAmount !== null) count++;
    if (this.usageLimit !== null) count++;
    if (this.usageLimitPerCustomer !== null) count++;
    count++;
    return Math.min(count, 16);
  }
  get payloadPreview(): string { return JSON.stringify(this.buildPayload(), null, 2); }

  // ─── Navigation ──────────────────────────────────────────────────────────────
  nextStep(): void { if (this.currentStep < 4) this.currentStep++; }
  prevStep(): void { if (this.currentStep > 1) this.currentStep--; }
  goToStep(n: number): void { if (n <= this.currentStep) this.currentStep = n; }
  saveDraft(): void { this._Toastr.info('Draft saved!', 'Draft'); }
  cancel(): void { if (confirm('Discard changes?')) this.resetForm(); }

  // ─── Build payload ────────────────────────────────────────────────────────────
  private buildPayload(): CreateDiscountPayload {
    const resolvedTargetId =
      this.targeting === 'store' || !this.targetId || this.targetId === ''
        ? '00000000-0000-0000-0000-000000000000'
        : this.targetId;

    const payload: any = {
      code: this.discountCode,
      name: this.discountName,
      description: this.discountDescription,
      discountType: this.discountTypeMap[this.selectedType],
      discountValueAmount: this.discountValue ?? 0,
      startDate: this.startDate ? new Date(this.startDate).toISOString() : new Date().toISOString(),
      endDate: this.endDate ? new Date(this.endDate).toISOString() : new Date().toISOString(),
      targets: [{
        tagetType: this.targetingTypeMap[this.targeting],
        targetId: resolvedTargetId,
      }],
      currency: this.currency,
      minimumPurchaseAmount: this.minPurchase ?? 0,
      minimumQuantity: this.minimumQuantity ?? 0,
      maximumDiscountAmount: this.maximumDiscountAmount ?? 0,
      canCombineWithOtherDiscounts: this.allowCombine,
      usageLimitPerCustomer: this.usageLimitPerCustomer ?? 0,
      totalUsageLimit: this.usageLimit ?? 0,
    };

    payload.buyQuantity = this.selectedType === 'bxgy' ? this.buyQuantity : 0;
    payload.getQuantity = this.selectedType === 'bxgy' ? this.getQuantity : 0;
    payload.getDiscountPercentage = this.selectedType === 'bxgy' ? this.getDiscountPercentage : 0;

    return payload;
  }

  // ─── Validate ─────────────────────────────────────────────────────────────────
  private validateForm(): string | null {
    if (!this.discountCode) return 'Discount code is required.';
    if (!this.discountName) return 'Discount name is required.';
    if (!this.startDate) return 'Start date is required.';
    if (!this.endDate) return 'End date is required.';

    if (this.selectedType === 'percentage') {
      if (!this.discountValue || this.discountValue <= 0 || this.discountValue > 100)
        return 'Percentage must be greater than 0 and less than or equal to 100.';
    }
    if (this.selectedType === 'fixed') {
      if (!this.discountValue || this.discountValue <= 0)
        return 'Fixed discount value must be greater than 0.';
    }
    if (this.selectedType === 'bxgy') {
      if (this.buyQuantity <= 0) return 'Buy quantity must be greater than 0.';
      if (this.getQuantity <= 0) return 'Get quantity must be greater than 0.';
      if (this.getDiscountPercentage <= 0 || this.getDiscountPercentage > 100)
        return 'Get discount percentage must be between 1 and 100.';
    }
    if (this.targeting !== 'store' && this.targetId === '00000000-0000-0000-0000-000000000000')
      return 'Please select a target from the dropdown.';

    return null;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────
  submitForm(): void {
    const validationError = this.validateForm();
    if (validationError) {
      // ✅ toastr بدل الـ errorMessage
      this._Toastr.warning(validationError, 'Validation Error', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
      });
      return;
    }

    this.isLoading = true;

    this._DiscountService.AddDiscount(this.buildPayload()).subscribe({
      next: () => {
        this.isLoading = false;

        // ✅ success toastr
        this._Toastr.success(
          `Discount "${this.discountName}" published successfully!`,
          'Published 🎉',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            progressBar: true,
          }
        );

        this.resetForm();

        setTimeout(() => {
          this._Router.navigate(['/discount-management']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;

        const message =
          err?.error?.errors?.[0] ??
          err?.error?.message ??
          'Something went wrong. Please try again.';

        // ✅ error toastr
        this._Toastr.error(message, 'Error', {
          timeOut: 5000,
          positionClass: 'toast-top-right',
          progressBar: true,
        });
      },
    });
  }

  // ─── Reset ────────────────────────────────────────────────────────────────────
  private resetForm(): void {
    this.currentStep = 1;
    this.discountCode = this.discountName = this.discountDescription = '';
    this.selectedType = 'percentage';
    this.discountValue = null;
    this.buyQuantity = this.getQuantity = this.getDiscountPercentage = 0;
    this.startDate = this.endDate = '';
    this.currency = 'USD';
    this.targeting = 'store';
    this.targetId = '00000000-0000-0000-0000-000000000000';
    this.targetIdOptions = [];
    this.isLoadingTargetIds = false;
    this.targetIdError = '';
    this.minPurchase = this.minimumQuantity = this.maximumDiscountAmount = null;
    this.usageLimit = this.usageLimitPerCustomer = null;
    this.allowCombine = false;
  }

  // ─── Edit mode ────────────────────────────────────────────────────────────────
  edit = {
    name: 'Summer Sale 2024', code: 'SUMMER20', discountValue: 15,
    minPurchase: 50.00 as number | null, usageLimit: 500 as number | null,
    currentUsage: 142, allowCombine: false, onePerCustomer: true,
    targeting: 'store' as TargetingOption,
    status: 'Active' as 'Active' | 'Disabled',
  };
  liveStats = { uses: 142, lastUsed: '12 mins ago', revenue: '$12,450', discounted: '$2,140', revTrend: '+12%' };
  recentUsers: RecentUser[] = [
    { initials: 'JD', name: 'John D.', time: '2m ago', bg: 'bg-blue-100', color: 'text-blue-600' },
    { initials: 'AS', name: 'Alice S.', time: '15m ago', bg: 'bg-green-100', color: 'text-green-600' },
    { initials: 'MK', name: 'Mike K.', time: '42m ago', bg: 'bg-purple-100', color: 'text-purple-600' },
  ];
  editHistory: EditHistoryEntry[] = [
    { date: 'Today, 10:23 AM', title: 'Limit Increased', detail: 'Usage limit changed from 200 to 500.', current: true },
    { date: 'Yesterday, 4:00 PM', title: 'Targeting Updated', detail: "Changed from 'VIP' to 'Entire Store'.", current: false },
    { date: 'June 1, 2024', title: 'Discount Created', detail: 'Initial setup completed.', current: false },
  ];

  get editUsagePercent(): number {
    if (!this.edit.usageLimit) return 0;
    return Math.min(100, (this.edit.currentUsage / this.edit.usageLimit) * 100);
  }

  toggleDisable(): void { this.edit.status = this.edit.status === 'Active' ? 'Disabled' : 'Active'; }

  saveChanges(): void {
    this._Toastr.success(`Changes saved for "${this.edit.name}"`, 'Saved ✅', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
      progressBar: true,
    });
  }

  ngOnInit(): void { }
}