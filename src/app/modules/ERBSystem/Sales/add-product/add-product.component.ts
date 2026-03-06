import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ProductService } from '../../../../core/services/products/product.service';
import { CategoriesService } from '../../../../core/services/categories/categories.service';
import { ToastrService } from 'ngx-toastr';
import { ApollocatoriesService } from '../../../../core/services/categories/apollocatories.service';
import { SidebaSalesComponent } from "../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";

export interface Step {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CommonModule, SidebaSalesComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent implements OnInit {
  private readonly _productService = inject(ProductService);
  private readonly _categoryService = inject(CategoriesService);
  private readonly _ApollocatoriesService = inject(ApollocatoriesService)
  private readonly _ToastrService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);


  // FIX: Renamed to categoryOptions to reflect actual usage (CategoryId select)
  categoryOptions: any[] = [];
  selectedFile: File | null = null;

  // ================= FORM =================
  addproductform: FormGroup = this._formBuilder.group({
    Name: [null, Validators.required],
    Code: [null, Validators.required],
    ShortDescription: [null, Validators.required],
    CategoryId: [null, Validators.required],
    ProductType: [null, Validators.required],
    UomCode: [null, Validators.required],
    UomName: [null, Validators.required],
    CostAmount: [null, Validators.required],
    SellingAmount: [null, Validators.required],
    Currency: [null, Validators.required],
    TaxRateValue: [null, Validators.required],
    TaxRateName: [null, Validators.required],
    TaxRateCode: [null, Validators.required],
    IsTrackInventory: [null, Validators.required],
    BaseBarcode: [null, Validators.required],
    Notes: [null],
  });

  // ================= STEP FIELD MAP =================
  // FIX: Added per-step validation so Next is blocked until current step fields are valid
  private readonly stepFields: string[][] = [
    ['Code', 'Name', 'ShortDescription', 'CategoryId', 'ProductType'],           // Step 0 — Basic Info
    ['UomCode', 'UomName', 'CostAmount', 'SellingAmount', 'Currency'],            // Step 1 — Unit & Pricing
    ['TaxRateValue', 'TaxRateName', 'TaxRateCode', 'IsTrackInventory', 'BaseBarcode'], // Step 2 — Tax & Inventory
    [],                                                                            // Step 3 — Specs, Variants & Image
  ];

  private isCurrentStepValid(): boolean {
    const fields = this.stepFields[this.currentStep];
    if (!fields.length) return true;
    return fields.every(f => this.addproductform.get(f)?.valid);
  }

  private touchCurrentStepFields(): void {
    this.stepFields[this.currentStep].forEach(f =>
      this.addproductform.get(f)?.markAsTouched()
    );
  }

  // ================= FILE =================
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  getcategorues(): void {
    this._ApollocatoriesService.getApollocategories().subscribe({
      next: (res: any) => {
        this.categoryOptions = res?.data?.parentCategories?.nodes ?? [];
        console.log('Raw response:', res.data);
        console.log(this.categoryOptions);
      },
      error: (err: any) => {
        console.error('Error loading categories:', err);
      },
    });
  }

  // ================= SUBMIT =================
  AddproductSubmit(): void {
    if (this.addproductform.invalid) {
      this.addproductform.markAllAsTouched();
      this._ToastrService.error('Please fill all required fields.', 'Validation Error');
      return;
    }

    const formValue = this.addproductform.value;
    const formData = new FormData();

    formData.append('Code', formValue.Code);
    formData.append('Name', formValue.Name);
    formData.append('ShortDescription', formValue.ShortDescription);
    formData.append('CategoryId', formValue.CategoryId);
    formData.append('ProductType', String(formValue.ProductType));
    formData.append('UomCode', formValue.UomCode);
    formData.append('UomName', formValue.UomName);
    formData.append('CostAmount', String(formValue.CostAmount));
    formData.append('SellingAmount', String(formValue.SellingAmount));
    formData.append('Currency', formValue.Currency);
    formData.append('TaxRateValue', String(formValue.TaxRateValue));
    formData.append('TaxRateName', formValue.TaxRateName);
    formData.append('TaxRateCode', formValue.TaxRateCode);
    formData.append('IsTrackInventory', formValue.IsTrackInventory ? 'true' : 'false');
    formData.append('BaseBarcode', formValue.BaseBarcode);
    formData.append('Notes', formValue.Notes ?? '');

    const specs = this.specifications
      .filter(s => s.name && s.value)
      .map((s, index) => ({
        key: s.name,
        value: s.value,
        displayOrder: index + 1
      }));
    formData.append('SpecificationsJson', JSON.stringify(specs));

    const variants = this.variants
      .filter(v => v.sku)
      .map(v => ({
        sku: v.sku,
        barcode: v.barcode,
        priceOverrideAmount: v.priceOverrideAmount ?? formValue.SellingAmount,
        options: v.options.filter(o => o.attributeName && o.value),
      }));
    formData.append('VariantsJson', JSON.stringify(variants));

    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    this._productService.addProduct(formData).subscribe({
      next: (res) => {
        console.log('Product created:', res);
        this._ToastrService.success('Add Product Success', 'Success');
        this.addproductform.reset();
        this.specifications = [{ name: '', value: '' }];
        this.variants = [{
          sku: '', barcode: '', priceOverrideAmount: null,
          options: [{ attributeName: 'Color', value: '' }, { attributeName: 'RAM', value: '' }]
        }];
        this.selectedFile = null;
        this.currentStep = 0;
      },
      // Extract the actual backend message from the interceptor response shape:
      // { isSuccess: false, data: null, errors: string[], message: string, timestamp: string }
      error: (err) => {
        console.error('Error:', err);
        const backendError = err?.error;
        if (backendError && !backendError.isSuccess) {
          const errorMessages: string[] = backendError.errors ?? [];
          const title = backendError.message ?? 'Error';
          // Show each error code as a separate toast so nothing is hidden
          if (errorMessages.length > 0) {
            errorMessages.forEach(msg =>
              this._ToastrService.error(msg, title)
            );
          } else {
            this._ToastrService.error(title, 'Error');
          }
        } else {
          this._ToastrService.error('Failed to create product. Please try again.', 'Error');
        }
      }
    });
  }

  cancel(): void {
    this.addproductform.reset();
    this.currentStep = 0;
  }

  // FIX: Removed localStorage usage; added toastr feedback for draft save
  saveDraft(): void {
    const draftData = this.addproductform.value;
    // Store in a component-level variable so no browser storage API is needed
    this._draftData = draftData;
    this._ToastrService.info('Draft saved successfully.', 'Draft Saved');
    console.log('Draft saved:', draftData);
  }

  private _draftData: any = null;

  // ── Stepper ─────────────────────────────
  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: true },
    { icon: 'percent', label: 'Discounts', active: false },
  ];

  steps: Step[] = [
    { label: 'Basic Info', icon: 'info' },
    { label: 'Unit & Pricing', icon: 'attach_money' },
    { label: 'Tax & Inventory', icon: 'inventory' },
    { label: 'Specs, Variants & Image', icon: 'tune' },
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
    // FIX: Validate current step fields before advancing
    if (!this.isCurrentStepValid()) {
      this.touchCurrentStepFields();
      this._ToastrService.warning('Please complete all required fields before continuing.', 'Incomplete');
      return;
    }
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    } else {
      this.AddproductSubmit();
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }
  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  // ── Variants ───────────────────────────
  // Each variant matches the API structure: { sku, barcode, priceOverrideAmount, options[] }
  // Each option matches: { attributeName, value }

  variants: Array<{
    sku: string;
    barcode: string;
    priceOverrideAmount: number | null;
    options: Array<{ attributeName: string; value: string }>;
  }> = [
      {
        sku: '',
        barcode: '',
        priceOverrideAmount: null,
        options: [
          { attributeName: 'Color', value: '' },
          { attributeName: 'RAM', value: '' },
        ],
      },
    ];

  addVariant(): void {
    this.variants.push({
      sku: '',
      barcode: '',
      priceOverrideAmount: null,
      options: this.variants[0]?.options.map(o => ({ attributeName: o.attributeName, value: '' })) ?? [
        { attributeName: 'Color', value: '' },
        { attributeName: 'RAM', value: '' },
      ],
    });
  }

  removeVariant(index: number): void {
    if (this.variants.length > 1) {
      this.variants.splice(index, 1);
    }
  }

  addOption(variantIndex: number): void {
    this.variants[variantIndex].options.push({ attributeName: '', value: '' });
  }

  removeOption(variantIndex: number, optionIndex: number): void {
    if (this.variants[variantIndex].options.length > 1) {
      this.variants[variantIndex].options.splice(optionIndex, 1);
    }
  }

  // ── Specifications ──────────────────────
  specifications: Array<{ name: string; value: string }> = [
    { name: '', value: '' }
  ];

  addSpec(): void {
    this.specifications.push({ name: '', value: '' });
  }

  removeSpec(index: number): void {
    if (this.specifications.length > 1) {
      this.specifications.splice(index, 1);
    }
  }

  // ── Init ───────────────────────────────
  ngOnInit(): void {
    // this._categoryService.getCategories().subscribe({
    //   next: (res) => {
    //     this.categoryOptions = res.map((c: any) => ({
    //       id: c.id,
    //       name: c.name
    //     }));
    //   },
    //   error: () => {
    //     this.categoryOptions = [];
    //     this._ToastrService.error('Failed to load categories.', 'Error');
    //   }
    // });

    this.getcategorues();
  }

}