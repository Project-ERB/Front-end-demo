import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  colorCode: string;
  size: string;
  price: number;
  stock: number;
  stockPercentage: number;
  stockLevel: 'high' | 'medium' | 'low';
  thumbnailUrl: string;
  selected: boolean;
}

export interface ProductSpec {
  key: string;
  label: string;
  value: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isMain?: boolean;
}

export interface Tab {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

export interface CategoryNode {
  id: string;
  label: string;
  expanded?: boolean;
  selected?: boolean;
  children?: CategoryNode[];
}

export interface ProductTag {
  id: string;
  label: string;
}

export interface VisibilityChannel {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface PricingForm {
  unitCost: number;
  unitPrice: number;
  chargeTax: boolean;
  taxName: string;
  taxCode: string;
  taxRate: number;
  taxActive: boolean;
}


export interface SpecAttribute {
  id: string;
  name: string;
  value: string;
  unit?: string;
  type: 'text' | 'select';
  options?: string[];
}

export interface SpecSettings {
  uomCode: string;
  uomName: string;
  classification: string;
  taxCategory: string;
}

@Component({
  selector: 'app-veiw-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './veiw-product.component.html',
  styleUrl: './veiw-product.component.scss',
})
export class VeiwProductComponent implements OnInit {

 // ── Product header ────────────────────────────────────────
  productName = "Men's Oxford Shirt - Slim Fit";
  productSku = '#19203';
  productStatus = 'Active';
  totalStock = 435;
  productImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkO5CcNaCraAawOVNiiA5mUYRxFUmsxUR98NXniF-ABGevGVSVz3jHTIUIPabxGAuTNFM8WhEMzKPvKL2VmJ7BAoE5q5vEiLrRo5Z9uRrYQR0RZB06QzgGdOJGHHddgeTvQyX52a0Oh-Q3Bg2XlBOg00t6jaD-IaALg5Gv3DHiBOPbgUQClYBEFyHCSci3kgBYy6WiMtZgE6nSi785G2R7AzIX4QC_Bz6VKNrhVIPqdM7nNViyYePJgW-kyBZoZP6WT8hRUKRQLCzB';

  // ── Tabs ──────────────────────────────────────────────────
  tabs: Tab[] = [
    { id: 'general',        label: 'General',        icon: 'info',         active: true  },
    { id: 'pricing',        label: 'Pricing',         icon: 'attach_money', active: false },
    { id: 'styles',         label: 'Styles',          icon: 'style',        active: false },
    { id: 'specifications', label: 'Specifications',  icon: 'tune',         active: false },
  ];
  activeTab = 'general';

  setActiveTab(tabId: string): void {
    this.tabs = this.tabs.map(t => ({ ...t, active: t.id === tabId }));
    this.activeTab = tabId;
  }

  // ── General Tab ───────────────────────────────────────────
  generalForm = {
    productName: "Men's Oxford Shirt - Slim Fit",
    sku: '19203',
    shortDescription: 'A classic wardrobe staple. This slim-fit Oxford shirt is crafted from 100% organic cotton for breathability and comfort.',
    fullDescription: `<p>Our <strong>Men's Oxford Shirt</strong> is designed for the modern professional who values both style and comfort.</p>
<p>Made from premium, sustainably sourced cotton, this shirt features:</p>
<ul>
<li>Button-down collar for a sharp look</li>
<li>Chest pocket with reinforced stitching</li>
<li>Adjustable cuffs</li>
<li>Curved hem suitable for tucked or untucked wear</li>
</ul>
<p>Perfect for office wear or casual weekends. Pair it with chinos or jeans for a versatile outfit.</p>
<h2>Care Instructions</h2>
<p>Machine wash cold with like colors. Tumble dry low. Warm iron if needed.</p>`,
    brand: 'Acme Apparel',
  };

  shortDescMaxLength = 160;
  get shortDescCharCount(): number { return this.generalForm.shortDescription.length; }

  brands = ['Select a brand...', 'Acme Apparel', 'Urban Thread', 'Nordic Wear'];

  categories: CategoryNode[] = [
    { id: 'women', label: 'Women' },
    {
      id: 'men', label: 'Men', expanded: true,
      children: [
        { id: 'men-tshirts', label: 'T-Shirts' },
        { id: 'men-shirts',  label: 'Shirts', selected: true },
        { id: 'men-pants',   label: 'Pants' },
      ],
    },
    { id: 'accessories', label: 'Accessories' },
  ];

  tags: ProductTag[] = [
    { id: '1', label: 'Summer Collection' },
    { id: '2', label: 'Best Seller' },
    { id: '3', label: 'Organic' },
  ];
  newTag = '';

  visibilityChannels: VisibilityChannel[] = [
    { key: 'online', label: 'Online Store Visibility', description: 'Visible on website and app', enabled: true },
    { key: 'pos',    label: 'POS Visibility',           description: 'Available in retail stores', enabled: true },
  ];

  toggleCategory(node: CategoryNode): void { node.expanded = !node.expanded; }

  selectCategory(node: CategoryNode, parent?: CategoryNode): void {
    this.categories.forEach(c => {
      c.selected = false;
      c.children?.forEach(ch => ch.selected = false);
    });
    node.selected = true;
    if (parent) parent.expanded = true;
  }

  addTag(): void {
    const label = this.newTag.trim();
    if (!label) return;
    this.tags = [...this.tags, { id: Date.now().toString(), label }];
    this.newTag = '';
  }
  removeTag(id: string): void { this.tags = this.tags.filter(t => t.id !== id); }

  toggleVisibility(key: string): void {
    this.visibilityChannels = this.visibilityChannels.map(ch =>
      ch.key === key ? { ...ch, enabled: !ch.enabled } : ch
    );
  }

  onRichTextInput(event: Event): void {
    this.generalForm.fullDescription = (event.target as HTMLElement).innerHTML;
  }
  execFormat(command: string): void { document.execCommand(command, false, undefined); }

  get safeFullDescription(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.generalForm.fullDescription);
  }

  // ── Pricing Tab ───────────────────────────────────────────
  pricingForm: PricingForm = {
    unitCost:  18.50,
    unitPrice: 45.00,
    chargeTax: false,
    taxName:   'VAT Standard',
    taxCode:   'VAT-20',
    taxRate:   20.00,
    taxActive: true,
  };

  // ngModel on type=number can return a string — always coerce
  private asNum(v: any): number { return parseFloat(v) || 0; }

  get taxAmount(): number {
    if (!this.pricingForm.chargeTax) return 0;
    return this.asNum(this.pricingForm.unitPrice) * (this.asNum(this.pricingForm.taxRate) / 100);
  }

  get profitPerUnit(): number {
    return this.asNum(this.pricingForm.unitPrice) - this.asNum(this.pricingForm.unitCost);
  }

  get marginPercent(): number {
    const price = this.asNum(this.pricingForm.unitPrice);
    if (!price) return 0;
    return (this.profitPerUnit / price) * 100;
  }

  get discountedMarginPercent(): number {
    const disc = this.asNum(this.pricingForm.unitPrice) * 0.8;
    if (!disc) return 0;
    return ((disc - this.asNum(this.pricingForm.unitCost)) / disc) * 100;
  }

  // Clamped 0–100 for inline bar style (avoids Tailwind purge issues with dynamic widths)
  get marginBarPct(): number {
    return Math.min(100, Math.max(0, this.marginPercent));
  }

  get marginHealthLabel(): string {
    if (this.marginPercent >= 40) return 'Healthy Margin.';
    if (this.marginPercent >= 20) return 'Acceptable Margin.';
    return 'Low Margin.';
  }

  get marginHealthClass(): string {
    if (this.marginPercent >= 40) return 'text-green-600 font-medium';
    if (this.marginPercent >= 20) return 'text-yellow-600 font-medium';
    return 'text-red-600 font-medium';
  }

  // Simple number formatter — avoids requiring DecimalPipe in template for basic cases
  fmt(v: number, digits = 2): string { return this.asNum(v).toFixed(digits); }

  // ── Styles Tab ────────────────────────────────────────────
  variantFilter = '';
  selectAll     = false;
  currentPage   = 1;
  totalVariants = 12;
  pageSize      = 3;

  variants: ProductVariant[] = [
    {
      id: '1', sku: '19203-NV-M', color: 'Navy Blue', colorCode: '#1e3b8a',
      size: 'Medium', price: 45, stock: 150, stockPercentage: 70, stockLevel: 'high',
      selected: false,
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGzWrLwTr5NyESpWgVLt6bn1rPiFuJQU8uQs9zYqLDuxH2F5cPtjnFIAF9WRQNXcMWWZwHSHTC3PYnaGUjKGDzm1WHHqDIvP1I3IQZgBPJ9A3-gZAJcbtEl3GjMoFQB0SYcIYT_nC7ob18m_jG4TtTX5DINDJw58f8fSg3j5W-m8j1Rq9LJIOeSfC-AZNnylbpYrBoLBy3OOljdmeNu8LGqVZJ1IaPkKbSJFSRqtHTOsTF9VMNCCglbnhVv2ZA5fUrht_rt6zfmWOT',
    },
    {
      id: '2', sku: '19203-NV-L', color: 'Navy Blue', colorCode: '#1e3b8a',
      size: 'Large', price: 45, stock: 85, stockPercentage: 40, stockLevel: 'medium',
      selected: false,
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABmEdIgN09qdGKBIz1mdcDFbUGPhwsQx0o4lkFoE6ezH4W4RRv6VwR0KF6y8A4waIJnkQrR1zEF2IWv703xbqvNdznluhRtAU52MSh4DX3HLHW-DiVBQFuPFuxTwj1WPeMEDyv8d_tdH6lnIo-_WXFVOQgoWr5kzD_NU_6wC3ihiUFSBFJ74yzyiesJG-L3PNzkC5-KqrDql2DhAEvFhbKw9MbxJNRB0CpJnJOcwKNXhxeqdCS9r3sjenIThwft4HdiCssKpUC-xjX',
    },
    {
      id: '3', sku: '19203-WH-M', color: 'White', colorCode: '#f8fafc',
      size: 'Medium', price: 45, stock: 200, stockPercentage: 90, stockLevel: 'high',
      selected: false,
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmZ-evWVJNFpuYGLeiGGNJHFXU0YxIpZGGD0TbVwnUcXgcxit0rBZssj9T1C521qTXikJQfK5sOF8zETKucYQ-fCdtgcBl5q7EGw2pUhawPpKvYUHZP3l4tETyThNQMx7pHomAG90crRD2om4IcyEOzX_HWVBgJC1kI-NiP903ibE0d5klIEKvXdS2MejOyxxq92QsqvXiglx1Xr6idLmQHekKU4Xlw2gvJI2yTPWhDwDyd8lqgR2UwKG0BjtdLNIg05kUQimRKIRr',
    },
  ];

  galleryImages: ProductImage[] = [
    {
      id: '1', alt: 'Product Front', isMain: true,
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU50RqteQS5e1hevGfP3yT8BX8Q4_Kgpl58395cqp-kVq9CJenvsU_M7RiHiT0atXwH2RU7S_934H9BcFN_HD0XyLM1dezJnGaZcSN27lkk8SgFkoFJyTF7ny4RMKZkvGrs48gI5MDDy7gI375RyAagpAzfwzA1BP_LVvIs67nTrI6CynVmOJbtRmk_mogVVm4H_lWDV-PabVTDnanAp_TwDC_DiUJ5w4jPsWhDD6rxh_mmwjSDrkS2oNJAJN5J1nMe1yMTLb3IedV',
    },
    {
      id: '2', alt: 'Product Detail',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGpo0vPrQRCnWndcQfDV0pUa1_2aCJX2TN-t9AHRoVzv8MT1vqGpnrtS9BB69oWHFWb4JOGxNDcd7dIUuKSyTJLvSB0gELtA4TBigt1nv9bstMUkc6ZYFPz8ZGLFnQ1NXcuYUAMaqKi2XixtPzR0DEHIgEuw9qQZ16Z0ZAy1GuIEvpJCJKuFyBT2sdxlCX0mQXTV4wLVxC3Ur6tJoE3mUzwnfi3zhJxXIKPJ9DQ5GLMJLUiyGwKGJCqq4vU8ccoytUQXwSeToG02g3',
    },
  ];

  get filteredVariants(): ProductVariant[] {
    if (!this.variantFilter.trim()) return this.variants;
    const q = this.variantFilter.toLowerCase();
    return this.variants.filter(v =>
      v.color.toLowerCase().includes(q) ||
      v.size.toLowerCase().includes(q)  ||
      v.sku.toLowerCase().includes(q)
    );
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.variants = this.variants.map(v => ({ ...v, selected: this.selectAll }));
  }

  toggleVariant(id: string): void {
    this.variants = this.variants.map(v => v.id === id ? { ...v, selected: !v.selected } : v);
    this.selectAll = this.variants.every(v => v.selected);
  }

  deleteVariant(id: string): void { this.variants = this.variants.filter(v => v.id !== id); }

  getStockBarClass(level: string): string {
    return level === 'high' ? 'bg-green-500' : level === 'medium' ? 'bg-yellow-500' : 'bg-red-500';
  }

  removeImage(id: string): void { this.galleryImages = this.galleryImages.filter(img => img.id !== id); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        this.galleryImages = [...this.galleryImages, {
          id: Date.now().toString(), url: e.target?.result as string, alt: file.name,
        }];
      };
      reader.readAsDataURL(file);
    });
  }

  // ── Specs / Sidebar ───────────────────────────────────────
  newSpecAttribute = '';
  specs: ProductSpec[] = [
    { key: 'material', label: 'Material', value: '100% Organic Cotton' },
    { key: 'fit',      label: 'Fit Type', value: 'Slim Fit'            },
    { key: 'care',     label: 'Care',     value: 'Machine Wash Cold'    },
    { key: 'origin',   label: 'Origin',   value: 'Made in Portugal'     },
    { key: 'weight',   label: 'Weight',   value: '220gsm'              },
  ];

  addSpec(): void {
    if (!this.newSpecAttribute.trim()) return;
    const key = this.newSpecAttribute.toLowerCase().replace(/\s+/g, '_');
    this.specs = [...this.specs, { key, label: this.newSpecAttribute, value: 'Click to edit' }];
    this.newSpecAttribute = '';
  }
  removeSpec(key: string): void { this.specs = this.specs.filter(s => s.key !== key); }

  get variantCount(): number { return this.totalVariants; }
  get averagePrice(): number {
    if (!this.variants.length) return 0;
    return this.variants.reduce((s, v) => s + v.price, 0) / this.variants.length;
  }

  get totalPages(): number { return Math.ceil(this.totalVariants / this.pageSize); }
  get pageStart():  number { return (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd():    number { return Math.min(this.currentPage * this.pageSize, this.totalVariants); }

  prevPage(): void { if (this.currentPage > 1)             this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ── Specifications Tab ────────────────────────────────────
  specAttributes: SpecAttribute[] = [
    { id: '1', name: 'Material',             value: '100% Organic Cotton',          type: 'text' },
    { id: '2', name: 'Weight',               value: '220',                           type: 'text', unit: 'gsm' },
    { id: '3', name: 'Dimensions (Packaged)',value: '30 x 25 x 2 cm',              type: 'text' },
    { id: '4', name: 'Care Instructions',    value: 'Machine wash cold, tumble dry low', type: 'text' },
    {
      id: '5', name: 'Country of Origin', value: 'Portugal', type: 'select',
      options: ['Portugal', 'Italy', 'China', 'Vietnam', 'India', 'Bangladesh'],
    },
  ];

  specSettings: SpecSettings = {
    uomCode:        'PCS',
    uomName:        'Pieces',
    classification: 'physical',
    taxCategory:    'standard',
  };

  specMetadata = {
    createdBy:   'Admin User',
    createdAt:   '2023-10-12 14:30',
    lastUpdated: '2 hours ago',
    avatarUrl:   'https://lh3.googleusercontent.com/aida-public/AB6AXuD0jVI590utfRP87n1BhZl7IBUIRLt5hJG4vKr2n06gq6G6BWr6u741p-7gBmwwLqYTUkscIkKbRG0OVxulPvQXZKvH9TQEsPVsfzwD8uOovUm5jSFxCFe9__jTs4AlJbfTMxDohPT2KX7kHIHoQx7u4FoDDVhPJiwZphOW0EA-dkUpKQQcUfAx96DmeLICkx0MEuiktequnUHN4A6KaroAXZ2EMK1GOCK9FA9GtoeO287KjMKYni13R_Svssvn89Gz5XaDt7igzSht',
  };

  classificationOptions = [
    { value: 'physical', label: 'Physical Good'  },
    { value: 'digital',  label: 'Digital Product' },
    { value: 'service',  label: 'Service'          },
    { value: 'bundle',   label: 'Bundle / Kit'     },
  ];

  taxCategoryOptions = [
    { value: 'standard', label: 'Standard Rate' },
    { value: 'reduced',  label: 'Reduced Rate'  },
    { value: 'zero',     label: 'Zero Rated'     },
    { value: 'exempt',   label: 'Tax Exempt'     },
  ];

  addSpecAttribute(): void {
    const id = Date.now().toString();
    this.specAttributes = [...this.specAttributes, { id, name: '', value: '', type: 'text' }];
  }

  removeSpecAttribute(id: string): void {
    this.specAttributes = this.specAttributes.filter(a => a.id !== id);
  }

  // ── Lifecycle ─────────────────────────────────────────────
  constructor(private sanitizer: DomSanitizer) {}
  ngOnInit(): void {}
}