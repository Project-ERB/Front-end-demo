import { AllowAccess, CreatePermissionRequest, PermissionService, PermissionName, PERMISSION_GROUPS } from './../../../../../core/services/permission/permission.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SiedeAdminComponent } from "../../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";

@Component({
  selector: 'app-create-permission',
  imports: [CommonModule, FormsModule, SiedeAdminComponent],
  templateUrl: './create-permission.component.html',
  styleUrl: './create-permission.component.scss',
})
export class CreatePermissionComponent {

  private readonly _ToastrService = inject(ToastrService);

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
      next: (res) => {
        console.log(res);
        this.isLoading = false;
        this._ToastrService.success('Permission created successfully!', 'successfully! ✅');
        this.onCancel();
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this._ToastrService.error('Permission created failed!', 'failed! ❌');
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