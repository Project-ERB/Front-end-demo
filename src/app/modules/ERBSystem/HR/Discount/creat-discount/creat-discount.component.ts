import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type DiscountType = 'percentage' | 'fixed' | 'bxgy';
export type TargetingOption = 'store' | 'collections' | 'customers';

export interface DiscountTypeOption {
  value: DiscountType; label: string; description: string; icon: string;
}
export interface Step { number: number; label: string; }
export interface RecentUser { initials: string; name: string; time: string; bg: string; color: string; }
export interface EditHistoryEntry { date: string; title: string; detail: string; current: boolean; }

@Component({
  selector: 'app-creat-discount',
  imports: [CommonModule, FormsModule],
  templateUrl: './creat-discount.component.html',
  styleUrl: './creat-discount.component.scss',
})
export class CreatDiscountComponent implements OnInit {

  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: true },
  ];

  isEditMode = false;

  // CREATE ─────────────────────────────────────────────────────────
  steps: Step[] = [
    { number: 1, label: 'Configuration' },
    { number: 2, label: 'Eligibility' },
    { number: 3, label: 'Review' },
  ];
  currentStep = 1;
  discountName = '';
  discountCode = '';

  generateCode(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    this.discountCode = Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  typeOptions: DiscountTypeOption[] = [
    { value: 'percentage', label: 'Percentage', description: 'A percentage off entire order', icon: 'percent' },
    { value: 'fixed', label: 'Fixed Amount', description: 'A fixed amount off the total', icon: 'attach_money' },
    { value: 'bxgy', label: 'Buy X Get Y', description: 'Discount specific product pairs', icon: 'redeem' },
  ];
  selectedType: DiscountType = 'percentage';
  discountValue: number | null = null;

  get valueLabel(): string { return this.selectedType === 'percentage' ? 'Discount Value (%)' : 'Discount Value ($)'; }
  get valueSuffix(): string { return this.selectedType === 'percentage' ? '%' : '$'; }
  get valuePlaceholder(): string { return this.selectedType === 'percentage' ? '15' : '10.00'; }

  rulesExpanded = true;
  minPurchase: number | null = null;
  usageLimit: number | null = null;
  allowCombine = false;
  onePerCustomer = true;

  // Step 3 publish options
  publishNotify = true;
  publishAnalytics = false;

  get summaryCode(): string { return this.discountCode || '--'; }
  get summaryTitle(): string { return this.discountName || 'New Discount'; }
  get summaryTypeLabel(): string { return this.typeOptions.find(t => t.value === this.selectedType)?.label ?? ''; }
  get summaryValueLine(): string {
    if (this.discountValue === null) return '';
    return this.selectedType === 'percentage'
      ? this.discountValue + '% Off'
      : '$' + Number(this.discountValue).toFixed(2) + ' Off';
  }

  nextStep(): void { if (this.currentStep < 3) this.currentStep++; else this.submitForm(); }
  prevStep(): void { if (this.currentStep > 1) this.currentStep--; }
  goToStep(n: number): void { if (n <= this.currentStep) this.currentStep = n; }
  saveDraft(): void { alert('Draft saved!'); }
  cancel(): void { if (confirm('Discard changes?')) alert('Cancelled'); }
  submitForm(): void { alert('Discount published!'); }

  // EDIT ───────────────────────────────────────────────────────────
  edit = {
    name: 'Summer Sale 2024',
    code: 'SUMMER20',
    discountValue: 15,
    minPurchase: 50.00 as number | null,
    usageLimit: 500 as number | null,
    currentUsage: 142,
    allowCombine: false,
    onePerCustomer: true,
    targeting: 'store' as TargetingOption,
    status: 'Active' as 'Active' | 'Disabled',
  };

  targetingOptions: Array<{ value: TargetingOption; label: string; description: string }> = [
    { value: 'store', label: 'Entire Store', description: 'Valid for all products currently in catalog.' },
    { value: 'collections', label: 'Specific Collections', description: 'Limit to selected product categories.' },
    { value: 'customers', label: 'Specific Customers', description: 'Limit to specific customer segments (e.g. VIP).' },
  ];

  liveStats = { uses: 142, lastUsed: '12 mins ago', revenue: '$12,450', discounted: '$2,140', revTrend: '+12%' };

  recentUsers: RecentUser[] = [
    { initials: 'JD', name: 'John D.', time: '2m ago', bg: 'bg-blue-100', color: 'text-blue-600' },
    { initials: 'AS', name: 'Alice S.', time: '15m ago', bg: 'bg-green-100', color: 'text-green-600' },
    { initials: 'MK', name: 'Mike K.', time: '42m ago', bg: 'bg-purple-100', color: 'text-purple-600' },
  ];

  editHistory: EditHistoryEntry[] = [
    { date: 'Today, 10:23 AM', title: 'Limit Increased', detail: 'Usage limit changed from 200 to 500 by Admin.', current: true },
    { date: 'Yesterday, 4:00 PM', title: 'Targeting Updated', detail: "Changed from 'VIP' to 'Entire Store'.", current: false },
    { date: 'June 1, 2024', title: 'Discount Created', detail: 'Initial setup completed.', current: false },
  ];

  get editUsagePercent(): number {
    if (!this.edit.usageLimit) return 0;
    return Math.min(100, (this.edit.currentUsage / this.edit.usageLimit) * 100);
  }

  toggleDisable(): void { this.edit.status = this.edit.status === 'Active' ? 'Disabled' : 'Active'; }
  saveChanges(): void { alert('Saved changes for "' + this.edit.name + '"'); }

  ngOnInit(): void { }
}
