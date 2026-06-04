import { AllowAccess, CreatePermissionRequest, PermissionService, PermissionName, PERMISSION_GROUPS } from './../../../../../core/services/permission/permission.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SiedeAdminComponent } from "../../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-permission',
  imports: [CommonModule, FormsModule, SiedeAdminComponent],
  templateUrl: './create-permission.component.html',
  styleUrl: './create-permission.component.scss',
})
export class CreatePermissionComponent {

  private readonly _ToastrService = inject(ToastrService);
  private readonly _router = inject(Router);

  permissionName: PermissionName | '' = '';
  description = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  permissionGroups = PERMISSION_GROUPS;

  allowAccess: AllowAccess = {
    allowCreate: false,
    allowDelete: false,
    allowUpdate: false,
    allowView: false,
  };

  constructor(private permissionService: PermissionService) { }

  onSubmit(): void {
    if (!this.permissionName || this.isLoading) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: CreatePermissionRequest = {
      name: this.permissionName,
      description: this.description.trim(),
      resources: [],
      allowAccess: { ...this.allowAccess },
    };

    this.permissionService.createPermission(payload).subscribe({
      next: (res: any) => { // ← ضف :any عشان TypeScript يسيبك في حالك
        console.log(res);
        this.isLoading = false;

        // ✅ استخدم الأقواس المربعة بدل النقطة
        const successMsg = res?.['message'] || res?.['data']?.['message'] || 'Permission created successfully!';

        this._ToastrService.success(successMsg, 'Success! ✅');
        this.successMessage = successMsg;

        setTimeout(() => {
          this._router.navigate(['/permissions']);
        }, 3000);

        this.onCancel();
      },
      error: (err: any) => { // ← ضف :any هنا كمان
        console.log(err);
        this.isLoading = false;

        // ✅ استخدم الأقواس المربعة بدل النقطة
        const errorMsg = err?.['error']?.['message'] || err?.['error']?.['errors']?.[0] || err?.['message'] || 'Permission creation failed!';

        this._ToastrService.error(errorMsg, 'Failed! ❌');
        this.errorMessage = errorMsg;
      },
    });
  }

  onCancel(): void {
    this.permissionName = '';
    this.description = '';
    this.allowAccess = {
      allowCreate: false,
      allowDelete: false,
      allowUpdate: false,
      allowView: false,
    };
  }
}