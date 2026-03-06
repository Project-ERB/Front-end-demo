import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../../../core/services/products/product.service';
import { ApollocatoriesService } from '../../../../core/services/categories/apollocatories.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edite-produect',
  imports: [CommonModule, FormsModule],
  templateUrl: './edite-produect.component.html',
  styleUrl: './edite-produect.component.scss',
})
export class EditeProduectComponent implements OnInit {

  private readonly _ProductService = inject(ProductService);
  private readonly _ApollocatoriesService = inject(ApollocatoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  productId!: string;
  editLoading = false;
  editError = '';
  categories: any[] = [];

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

  // ── Specifications: key/value/displayOrder ────────────────────────
  editSpecifications: { key: string; value: string; displayOrder: number }[] = [];

  addSpecification(): void {
    this.editSpecifications.push({
      key: '',
      value: '',
      displayOrder: this.editSpecifications.length + 1
    });
  }

  removeSpecification(index: number): void {
    this.editSpecifications.splice(index, 1);
    this.editSpecifications.forEach((s, i) => s.displayOrder = i + 1);
  }

  // ── Variants: sku/barcode/priceOverrideAmount/options ─────────────
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
      options: [{ attributeName: '', value: '' }]
    });
  }

  removeVariant(index: number): void {
    this.editVariants.splice(index, 1);
  }

  addVariantOption(variantIndex: number): void {
    this.editVariants[variantIndex].options.push({ attributeName: '', value: '' });
  }

  removeVariantOption(variantIndex: number, optionIndex: number): void {
    this.editVariants[variantIndex].options.splice(optionIndex, 1);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────
  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.loadCategories();
    this.loadProduct();
  }

  loadCategories(): void {
    this._ApollocatoriesService.getApollocategories().subscribe({
      next: (res: any) => {
        this.categories = res?.data?.parentCategories?.nodes ?? [];
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }

  loadProduct(): void {
    this._ProductService.getProductById(this.productId).subscribe({
      next: (res: any) => {
        console.log(res);
        const allProducts: any[] = res?.data?.products?.nodes ?? [];
        const product = allProducts.find(
          (p: any) => p.id?.toLowerCase() === this.productId?.toLowerCase()
        );
        console.log('Route ID:', this.productId);
        console.log('All IDs:', allProducts.map(p => p.id));

        if (!product) {
          this.editError = 'Product not found';
          return;
        }

        this.editForm = {
          Name: product.name ?? '',
          ShortDescription: product.shortDescription ?? '',
          CategoryId: product.categoryId ?? '',
          ProductType: product.productType === 'GOODS' ? 0
            : product.productType === 'SERVICE' ? 1 : '',
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

        this.editSpecifications = product.specifications?.map((s: any, i: number) => ({
          key: s.key ?? '',
          value: s.value ?? '',
          displayOrder: s.displayOrder ?? i + 1
        })) ?? [];

        this.editVariants = product.variants?.map((v: any) => ({
          sku: v.sku ?? '',
          barcode: v.barcode ?? '',
          priceOverrideAmount: v.priceOverrideAmount ?? null,
          options: v.options?.map((o: any) => ({
            attributeName: o.attributeName ?? '',
            value: o.value ?? ''
          })) ?? [{ attributeName: '', value: '' }]
        })) ?? [];
      },
      error: () => {
        this.editError = 'Failed to load product';
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.editForm.image = input.files[0];
    }
  }

  submitEdit(): void {
    this.editLoading = true;
    this.editError = '';

    // Filter out empty specs
    const cleanSpecifications = this.editSpecifications.filter(
      s => s.key?.trim() && s.value?.trim()
    );

    // Filter out empty variant options
    const cleanVariants = this.editVariants.map(v => ({
      ...v,
      options: v.options.filter(o => o.attributeName?.trim() && o.value?.trim())
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
      next: () => {
        this.editLoading = false;
        this.router.navigate(['/product-management']);
      },
      error: (err) => {
        this.editLoading = false;
        const errors = err?.error?.errors;
        if (errors) {
          this.editError = Object.values(errors).flat().join(', ');
        } else {
          this.editError = err?.error?.message ?? 'Failed to update product.';
        }
      },
    });
  }
}