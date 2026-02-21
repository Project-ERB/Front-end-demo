import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Step {
  label: string;
  icon: string;
}

export interface GeneralInfoForm {
  productName: string;
  productCode: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
}

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent {

  // ── Sidebar (same as all previous components) ─────────────────────
  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: true },
    { icon: 'percent', label: 'Discounts', active: false },
  ];

  // ── Stepper ───────────────────────────────────────────────────────
  steps: Step[] = [
    { label: 'General Info', icon: 'info' },
    { label: 'Pricing & Tax', icon: 'attach_money' },
    { label: 'Styles & Variants', icon: 'style' },
    { label: 'Specifications', icon: 'tune' },
  ];

  currentStep = 0;

  get progressPercent(): string {
    const pct = (this.currentStep / (this.steps.length - 1)) * 100;
    return `${pct}%`;
  }

  goToStep(index: number): void {
    if (index <= this.currentStep) this.currentStep = index;
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) this.currentStep++;
    else this.submitForm();
  }

  prevStep(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  get isLastStep(): boolean { return this.currentStep === this.steps.length - 1; }
  get isFirstStep(): boolean { return this.currentStep === 0; }

  // ── Step 0: General Info form ─────────────────────────────────────
  form: GeneralInfoForm = {
    productName: '', productCode: '', sku: '',
    shortDescription: '', fullDescription: '',
  };

  get shortDescLength(): number { return this.form.shortDescription.length; }

  toolbarButtons = [
    { icon: 'format_bold', title: 'Bold', sep: false },
    { icon: 'format_italic', title: 'Italic', sep: false },
    { icon: 'format_underlined', title: 'Underline', sep: true },
    { icon: 'format_list_bulleted', title: 'Bullet List', sep: false },
    { icon: 'format_list_numbered', title: 'Numbered List', sep: true },
    { icon: 'link', title: 'Insert Link', sep: false },
    { icon: 'image', title: 'Insert Image', sep: false },
  ];

  // ── Step 1: Pricing & Tax form ────────────────────────────────────
  pricing = {
    basePrice: null as number | null,
    costPerItem: null as number | null,
    priceIncludesTax: false,
    taxCategory: 'standard' as 'standard' | 'reduced' | 'zero' | 'exempt',
  };

  taxRates: Record<string, number> = {
    standard: 0.20,
    reduced: 0.05,
    zero: 0.00,
    exempt: 0.00,
  };

  taxOptions = [
    { value: 'standard', label: 'Standard Rate (20%)' },
    { value: 'reduced', label: 'Reduced Rate (5%)' },
    { value: 'zero', label: 'Zero Rate (0%)' },
    { value: 'exempt', label: 'Tax Exempt' },
  ];

  get taxRate(): number { return this.taxRates[this.pricing.taxCategory] ?? 0; }

  get profitPerItem(): number {
    const base = this.pricing.basePrice ?? 0;
    const cost = this.pricing.costPerItem ?? 0;
    return base - cost;
  }

  get marginPercent(): number {
    const base = this.pricing.basePrice ?? 0;
    if (base === 0) return 0;
    return (this.profitPerItem / base) * 100;
  }

  get finalPriceIncTax(): number {
    const base = this.pricing.basePrice ?? 0;
    if (this.pricing.priceIncludesTax) return base;
    return base * (1 + this.taxRate);
  }

  formatCurrency(val: number): string {
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  }

  // ── Step 2: Styles & Variants ────────────────────────────────────
  hasVariants = true;

  attributeOptions = ['Color', 'Size', 'Material', 'Style', 'Finish'];

  attributes: Array<{ name: string; values: string[]; inputVal: string }> = [
    { name: 'Color', values: ['Red', 'Blue'], inputVal: '' },
    { name: 'Size', values: ['S', 'M', 'L'], inputVal: '' },
  ];

  generatedVariants: Array<{ combo: string; sku: string; price: number | null; stock: number | null; selected: boolean }> = [];

  get allVariantsSelected(): boolean {
    return this.generatedVariants.length > 0 && this.generatedVariants.every(v => v.selected);
  }

  toggleAllVariants(checked: boolean): void {
    this.generatedVariants.forEach(v => v.selected = checked);
  }

  addAttribute(): void {
    this.attributes.push({ name: 'Color', values: [], inputVal: '' });
  }

  removeAttribute(i: number): void {
    this.attributes.splice(i, 1);
  }

  addValueOnEnter(event: KeyboardEvent, attr: { values: string[]; inputVal: string }): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const val = attr.inputVal.trim().replace(/,$/, '');
      if (val && !attr.values.includes(val)) attr.values.push(val);
      attr.inputVal = '';
    }
  }

  removeValue(attr: { values: string[] }, value: string): void {
    attr.values = attr.values.filter(v => v !== value);
  }

  generateVariants(): void {
    // cartesian product of all attribute value arrays
    const filled = this.attributes.filter(a => a.values.length > 0);
    if (!filled.length) return;
    let combos: string[][] = [[]];
    for (const attr of filled) {
      combos = combos.flatMap(c => attr.values.map(v => [...c, v]));
    }
    this.generatedVariants = combos.map(c => ({
      combo: c.join(' / '),
      sku: 'PROD-' + c.map(v => v.toUpperCase().slice(0, 3)).join('-'),
      price: this.pricing.basePrice,
      stock: 0,
      selected: false,
    }));
  }

  removeVariant(i: number): void { this.generatedVariants.splice(i, 1); }

  bulkEditPrice(): void {
    const p = prompt('Set price for all selected variants:');
    if (p === null) return;
    const num = parseFloat(p);
    if (!isNaN(num)) this.generatedVariants.filter(v => v.selected).forEach(v => v.price = num);
  }

  bulkEditStock(): void {
    const s = prompt('Set stock for all selected variants:');
    if (s === null) return;
    const num = parseInt(s, 10);
    if (!isNaN(num)) this.generatedVariants.filter(v => v.selected).forEach(v => v.stock = num);
  }

  // ── Actions ───────────────────────────────────────────────────────
  saveDraft(): void { alert('Draft saved!'); }
  cancel(): void { if (confirm('Discard changes?')) alert('Cancelled'); }
  submitForm(): void { alert('Product submitted!'); }

  ngOnInit(): void {
    // seed some generated variants to match the HTML design
    this.generateVariants();
  }

  // ── Step 3: Specifications ────────────────────────────────────────
  specifications: Array<{ name: string; value: string }> = [
    { name: 'Material', value: '100% Cotton' },
    { name: 'Weight', value: '250g' },
    { name: 'Dimensions', value: '40 x 30 cm' },
  ];

  addSpec(): void {
    this.specifications.push({ name: '', value: '' });
  }

  removeSpec(i: number): void {
    if (this.specifications.length > 1) {
      this.specifications.splice(i, 1);
    }
  }

}
