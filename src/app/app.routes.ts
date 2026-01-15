import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirect root to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth Layout
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/auth/auth.component').then((c) => c.AuthComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./modules/Auth/login/login.component').then(
            (c) => c.LoginComponent
          ),
        title: 'Login',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./modules/Auth/register/register.component').then((c) => c.RegisterComponent),
        title: 'Register',
      },
      {
        path: 'forget-password',
        loadComponent: () =>
          import(
            './modules/Auth/forget-password/forget-password.component'
          ).then((c) => c.ForgetPasswordComponent),
        title: 'Forget Password',
      },
      {
        path: 'verification',
        loadComponent: () =>
          import('./modules/Auth/otp/otp.component').then(
            (c) => c.OTPComponent
          ),
        title: 'Verification',
      },
    ],
  },

  // ERB Layout 
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/erb/erb.component').then((c) => c.ERBComponent),
    children: [
    
      {
        path: 'admin',
        loadComponent: () =>
          import('./modules/ERBSystem/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
        title: 'Admin',
      },
      {
        path: 'employee',
        loadComponent: () =>
          import('./modules/ERBSystem/employee/employee.component').then(
            (m) => m.EmployeeComponent
          ),
        title: 'Employee',
      },
      {
        path: 'products',
        loadComponent: () =>
          import(
            './modules/ERBSystem/Prodects/products/products.component'
          ).then((m) => m.ProductsComponent),
        title: 'Products',
      },
      {
        path: 'AddProduect',
        loadComponent: () =>
          import(
            './modules/ERBSystem/Prodects/add-produect/add-produect.component'
          ).then((a) => a.AddProduectComponent),
        title: 'AddProduect',
      },
      // {
      //   path: 'EditeProduect',
      //   loadComponent: () =>
      //     import(
      //       './modules/ERBSystem/Prodects/edite-produect/edite-produect.component'
      //     ).then((E) => E.EditeProduectComponent ),
      //   title: 'EditeProduect',
      // },
      {
        path: 'categories',
        loadComponent: () =>
          import('./modules/ERBSystem/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
        title: 'Categories',
      },
      {
        path: 'new-category',
        loadComponent: () =>
          import(
            './modules/ERBSystem/new-category/new-category.component'
          ).then((m) => m.NewCategoryComponent),
        title: 'New Category',
      },
    ],
  },
  // E-Commerce Layout
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/e-commerc/e-commerc.component').then(
        (e) => e.ECommercComponent
      ),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./modules/E-Commerce/home/home.component').then(
            (h) => h.HomeComponent
          ),
        title: 'Home',
      },
      {
        path: 'product',
        loadComponent: () =>
          import(
            './modules/E-Commerce/product-details/product-details.component'
          ).then((m) => m.ProductDetailsComponent),
        title: 'Product',
      }, //Demo
      {
        path: 'product/:id',
        loadComponent: () =>
          import(
            './modules/E-Commerce/product-details/product-details.component'
          ).then((m) => m.ProductDetailsComponent),
        title: 'Product-Details',
      },

      {
        path: 'cart',
        loadComponent: () =>
          import('./modules/E-Commerce/cart/cart.component').then(
            (m) => m.CartComponent
          ),
        title: 'Cart',
      },
      {
        path: 'Profile',
        loadComponent: () =>
          import(
            './modules/E-Commerce/personal-information/personal-information.component'
          ).then((p) => p.PersonalInformationComponent),
        title: 'Profile',
      },

      {
        path: 'security',
        loadComponent: () =>
          import('./modules/E-Commerce/security/security.component').then(
            (s) => s.SecurityComponent
          ),
        title: 'Security',
      },
      {
        path: 'help-support',
        loadComponent: () =>
          import(
            './modules/E-Commerce/help-support/help-support.component'
          ).then((m) => m.HelpSupportComponent),
        title: 'Help-Support',
      },
    ],
  },
  // HR Layout
   {
    path: '',
    loadComponent: () =>
      import('./core/layout/hr/hr.component').then((H) => H.HRComponent),
    children: [
         {
        path: 'usermanagemant',
        loadComponent: () =>
          import(
            './modules/ERBSystem/HR/usermanagemant/usermanagemant.component'
          ).then((U) => U.UsermanagemantComponent),
        title: 'usermanagemant',
      },
      {
        path: 'assign-roles',
        loadComponent: () =>
          import(
            './modules/ERBSystem/HR/assign-roles-to-user/assign-roles-to-user.component'
          ).then((A) => A.AssignRolesToUserComponent),
        title: 'assign-roles',
      },
      {
        path: 'manage-role',
        loadComponent: () =>
          import(
            './modules/ERBSystem/HR/manage-role-permissions/manage-role-permissions.component'
          ).then((M) => M.ManageRolePermissionsComponent),
        title: 'manage-role',
      },
      {
        path: 'hrapprovals',
        loadComponent: () =>
          import(
            './modules/ERBSystem/HR/manager-hrapprovals/manager-hrapprovals.component'
          ).then((m) => m.ManagerHRApprovalsComponent),
        title: 'hrapprovals',
      },
      {
        path: 'permission',
        loadComponent: () =>
          import(
            './modules/ERBSystem/HR/permissionmanagement/permissionmanagement.component'
          ).then((P) => P.PermissionmanagementComponent),
        title: 'permissionmanagement',
      },
      {
        path: 'super-admin',
        loadComponent: () =>
          import(
            './modules/ERBSystem/HR/super-admin-overview/super-admin-overview.component'
          ).then((m) => m.SuperAdminOverviewComponent),
        title: 'super-admin',
      },
      {
        path: 'rolemanagement',
        loadComponent: () =>
          import(
            './modules/ERBSystem/HR/rolemanagement/rolemanagement.component'
          ).then((R) => R.RolemanagementComponent),
        title: 'rolemanagement',
      },
      
    ]
    }
,
  // Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./modules/NotFound/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
