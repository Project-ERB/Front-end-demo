import { Component, inject, OnInit, HostListener } from '@angular/core';
import { ProductService } from '../../../../core/services/products/product.service';
import { ApollocatoriesService } from '../../../../core/services/categories/apollocatories.service';
import { CategoriesService } from '../../../../core/services/categories/categories.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable } from 'rxjs';
import { SidebaSalesComponent } from '../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component';

export interface Step {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-edite-produect',
  imports: [CommonModule, FormsModule, SidebaSalesComponent],
  templateUrl: './edite-produect.component.html',
  styleUrl: './edite-produect.component.scss',
})
export class EditeProduectComponent implements OnInit {

  private readonly _ProductService = inject(ProductService);
  private readonly _ApollocatoriesService = inject(ApollocatoriesService);
  private readonly _categoryService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _ToastrService = inject(ToastrService);

  productId!: string;
  editLoading = false;
  editError = '';

  // ── Category tree (parent + children) ─────────────────────────────
  categoryOptions: Array<{
    id: string;
    name: string;
    children: Array<{ id: string; name: string }>;
  }> = [];

  // ── Mobile / Sidebar State ────────────────────────────────────────
  sidebarOpen = false;
  isMobile = false;

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile) this.sidebarOpen = false;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  // ── Stepper ───────────────────────────────────────────────────────
  steps: Step[] = [
    { label: 'Basic Info', icon: 'info' },
    { label: 'Pricing', icon: 'attach_money' },
    { label: 'Tax & Inventory', icon: 'inventory' },
    { label: 'Specs & Variants', icon: 'tune' },
  ];

  currentStep = 0;

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }
  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  goToStep(index: number): void {
    if (index <= this.currentStep) this.currentStep = index;
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  // ── Form Model ────────────────────────────────────────────────────
  editForm: any = {
    Name: '',
    ShortDescription: '',
    CategoryId: '',
    ProductType: '',
    UomCode: '',
    UomName: '',
    CostAmount: null,
    SellingAmount: null,
    Currency: '',
    TaxRateValue: null,
    TaxRateName: '',
    TaxRateCode: '',
    IsTrackInventory: false,
    BaseBarcode: '',
    Notes: '',
    image: null as File | null,
  };

  // ── Dirty tracking ────────────────────────────────────────────────
  private _originalSnapshot = '';
  get isFormDirty(): boolean {
    return JSON.stringify(this.editForm) !== this._originalSnapshot;
  }

  // ── Specifications ────────────────────────────────────────────────
  editSpecifications: { key: string; value: string; displayOrder: number }[] = [];

  addSpecification(): void {
    this.editSpecifications.push({
      key: '',
      value: '',
      displayOrder: this.editSpecifications.length + 1,
    });
    this._ToastrService.info('Specification row added', 'Added');
  }

  removeSpecification(index: number): void {
    this.editSpecifications.splice(index, 1);
    this.editSpecifications.forEach((s, i) => (s.displayOrder = i + 1));
  }

  // ── Variants ──────────────────────────────────────────────────────
  editVariants: {
    sku: string;
    barcode: string;
    priceOverrideAmount: number | null;
    options: { attributeName: string; value: string }[];
  }[] = [];

  addVariant(): void {
    this.editVariants.push({
      sku: '',
      barcode: '',
      priceOverrideAmount: null,
      options: [{ attributeName: '', value: '' }],
    });
    this._ToastrService.info('Variant added', 'Added');
  }

  removeVariant(index: number): void {
    this.editVariants.splice(index, 1);
  }

  addVariantOption(variantIndex: number): void {
    this.editVariants[variantIndex].options.push({
      attributeName: '',
      value: '',
    });
  }

  removeVariantOption(variantIndex: number, optionIndex: number): void {
    this.editVariants[variantIndex].options.splice(optionIndex, 1);
  }

  // ── Image preview ─────────────────────────────────────────────────
  imagePreviewUrl: string | null = null;

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.editForm.image = file;

      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.editForm.image = null;
    this.imagePreviewUrl = null;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────
  ngOnInit(): void {
    this.isMobile = window.innerWidth < 1024;
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.loadCategories();
    this.loadProduct();
  }

  loadCategories(): void {
    this._ApollocatoriesService.getApollocategories().subscribe({
      next: (res: any) => {
        const parents: any[] = res?.data?.parentCategories?.nodes ?? [];
        if (!parents.length) {
          this.categoryOptions = [];
          return;
        }
        const childRequests: Observable<any[]>[] = parents.map((p: any) =>
          this._categoryService.getChildCategories(p.id)
        );
        forkJoin(childRequests).subscribe({
          next: (childResults: any[][]) => {
            this.categoryOptions = parents.map((parent: any, i: number) => ({
              ...parent,
              children: childResults[i] ?? [],
            }));
          },
          error: () => {
            this.categoryOptions = parents.map((p: any) => ({
              ...p,
              children: [],
            }));
          },
        });
      },
      error: () => {
        this.categoryOptions = [];
      },
    });
  }

  loadProduct(): void {
    this._ProductService.getProductById(this.productId).subscribe({
      next: (res: any) => {
        const allProducts: any[] = res?.data?.products?.nodes ?? [];
        const product = allProducts.find(
          (p: any) => p.id?.toLowerCase() === this.productId?.toLowerCase()
        );

        if (!product) {
          this.editError = 'Product not found';
          this._ToastrService.error('Product not found', 'Error');
          return;
        }

        this.editForm = {
          Name: product.name ?? '',
          ShortDescription: product.shortDescription ?? '',
          CategoryId: product.categoryId ?? '',
          ProductType:
            product.productType === 'GOODS'
              ? 0
              : product.productType === 'SERVICE'
                ? 1
                : '',
          UomCode: product.uomCode ?? '',
          UomName: product.uomName ?? '',
          CostAmount: product.costPrice ?? null,
          SellingAmount: product.sellingPrice ?? null,
          Currency: product.currency ?? '',
          TaxRateValue: product.taxRateValue ?? null,
          TaxRateName: product.taxRateName ?? '',
          TaxRateCode: product.taxRateCode ?? '',
          IsTrackInventory: product.isTrackInventory ?? false,
          BaseBarcode: product.baseBarcode ?? '',
          Notes: product.notes ?? '',
          image: null,
        };

        // Snapshot for dirty tracking
        this._originalSnapshot = JSON.stringify(this.editForm);

        this.editSpecifications =
          product.specifications?.map((s: any, i: number) => ({
            key: s.key ?? '',
            value: s.value ?? '',
            displayOrder: s.displayOrder ?? i + 1,
          })) ?? [];

        this.editVariants =
          product.variants?.map((v: any) => ({
            sku: v.sku ?? '',
            barcode: v.barcode ?? '',
            priceOverrideAmount: v.priceOverrideAmount ?? null,
            options: v.options?.map((o: any) => ({
              attributeName: o.attributeName ?? '',
              value: o.value ?? '',
            })) ?? [{ attributeName: '', value: '' }],
          })) ?? [];

        // Set existing image preview if available
        if (product.imageUrl) {
          this.imagePreviewUrl = product.imageUrl;
        }
      },
      error: () => {
        this.editError = 'Failed to load product';
        this._ToastrService.error('Failed to load product', 'Error');
      },
    });
  }

  // ── Navigation with unsaved-changes guard ─────────────────────────
  cancel(): void {
    if (this.isFormDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return;
    }
    this.router.navigate(['/product-management']);
  }

  // ── Submit ────────────────────────────────────────────────────────
  // ── Submit ────────────────────────────────────────────────────────
  submitEdit(): void {
    this.editLoading = true;
    this.editError = '';

    const cleanSpecifications = this.editSpecifications.filter(
      (s) => s.key?.trim() && s.value?.trim()
    );

    const cleanVariants = this.editVariants.map((v) => ({
      ...v,
      options: v.options.filter(
        (o) => o.attributeName?.trim() && o.value?.trim()
      ),
    }));

    const formData = new FormData();
    formData.append('Name', this.editForm.Name);
    formData.append('ShortDescription', this.editForm.ShortDescription);
    formData.append('CategoryId', this.editForm.CategoryId);
    formData.append('ProductType', String(this.editForm.ProductType));
    formData.append('UomCode', this.editForm.UomCode);
    formData.append('UomName', this.editForm.UomName);
    formData.append('CostAmount', String(this.editForm.CostAmount ?? 0));
    formData.append('SellingAmount', String(this.editForm.SellingAmount ?? 0));
    formData.append('Currency', this.editForm.Currency ?? '');
    formData.append('TaxRateValue', String(this.editForm.TaxRateValue ?? 0));
    formData.append('TaxRateName', this.editForm.TaxRateName ?? '');
    formData.append('TaxRateCode', this.editForm.TaxRateCode ?? '');
    formData.append('IsTrackInventory', String(this.editForm.IsTrackInventory));
    formData.append('BaseBarcode', this.editForm.BaseBarcode ?? '');
    formData.append('Notes', this.editForm.Notes ?? '');
    formData.append('SpecificationsJson', JSON.stringify(cleanSpecifications));
    formData.append('VariantsJson', JSON.stringify(cleanVariants));

    if (this.editForm.image) {
      formData.append('image', this.editForm.image);
    }

    this._ProductService.ubdateProduct(this.productId, formData).subscribe({
      next: (res: any) => { // ← أضف :any
        this.editLoading = false;
        this._originalSnapshot = JSON.stringify(this.editForm); // reset dirty

        // ✅ استخراج رسالة النجاح من الـ Response
        const successMsg = res?.['message'] || res?.['data']?.['message'] || 'Product updated successfully';
        this._ToastrService.success(successMsg, 'Updated');

        setTimeout(() => {
          this.router.navigate(['/product-management']);
        }, 1200);
      },
      error: (err: any) => { // ← أضف :any
        this.editLoading = false;

        // ✅ استخراج رسالة الخطأ باستخدام الأقواس المربعة
        const backendError = err?.['error'];
        if (backendError && backendError['isSuccess'] === false) {
          const errorMessages: any[] = backendError?.['errors'] ?? [];
          const title = backendError?.['message'] ?? 'Error';
          if (errorMessages.length > 0) {
            errorMessages.forEach((msg: any) =>
              this._ToastrService.error(msg, title)
            );
          } else {
            this._ToastrService.error(title, 'Error');
          }
          this.editError = title;
        } else {
          const fallbackMsg = err?.['error']?.['message'] || err?.['message'] || 'Failed to update product.';
          this.editError = fallbackMsg;
          this._ToastrService.error(fallbackMsg, 'Error');
        }
      },
    });
  }
  // ── Unsaved changes guard on browser back/refresh ─────────────────
  @HostListener('window:beforeunload')
  onBeforeUnload(): boolean {
    if (this.isFormDirty) return false;
    return true;
  }
}
