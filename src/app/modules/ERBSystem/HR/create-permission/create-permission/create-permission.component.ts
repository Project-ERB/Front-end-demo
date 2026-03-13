import { AllowAccess, CreatePermissionRequest, PermissionService, Resource } from './../../../../../core/services/permission/permission.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SiedeAdminComponent } from "../../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";

interface Module {
  label: string;
  value: Resource;
  checked: boolean;
}


@Component({
  selector: 'app-create-permission',
  imports: [CommonModule, FormsModule, SiedeAdminComponent],
  templateUrl: './create-permission.component.html',
  styleUrl: './create-permission.component.scss',
})
export class CreatePermissionComponent {

  private readonly _ToastrService = inject(ToastrService)
  permissionName = '';
  description = '';

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // allowAccess — كل واحدة false by default، تبقى true لو المستخدم شيكها
  allowAccess: AllowAccess = {
    allowCreate: false,
    allowDelete: false,
    allowUpdate: false,
    allowView: false,
  };

  modules: Module[] = Object.keys(Resource)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key,
      value: Resource[key as keyof typeof Resource] as Resource,
      checked: false,
    }));

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Users', active: false },
    { icon: 'lock_open', label: 'Permissions', active: true },
    { icon: 'manage_accounts', label: 'Roles', active: false },
  ];

  systemItems = [
    { icon: 'settings', label: 'Settings' },
    { icon: 'history_edu', label: 'Audit Logs' },
  ];

  constructor(private permissionService: PermissionService) { }

  onSubmit(): void {
    if (!this.permissionName.trim() || this.isLoading) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: CreatePermissionRequest = {
      name: this.permissionName.trim(),
      description: this.description.trim(),
      resources: this.modules.filter(m => m.checked).map(m => m.value),
      allowAccess: { ...this.allowAccess },
    };

    this.permissionService.createPermission(payload).subscribe({
      next: (res) => {
        console.log(res)
        this.isLoading = false;
        this._ToastrService.success('Permission created successfully!', 'successfully! ✅')
        this.onCancel();
      },
      error: (err) => {
        console.log(err)
        this.isLoading = false;
        this._ToastrService.error('Permission created failed!', 'failed! ❌')
      },
    });
  }

  onCancel(): void {
    this.permissionName = '';
    this.description = '';
    this.modules.forEach(m => (m.checked = false));
    this.allowAccess = {
      allowCreate: false,
      allowDelete: false,
      allowUpdate: false,
      allowView: false,
    };
  }
}
