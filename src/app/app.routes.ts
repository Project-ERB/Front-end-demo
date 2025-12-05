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
          import('./modules/Auth/register/register').then((c) => c.Register),
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

  // ERB Layout (roles + main app pages)
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/erb/erb.component').then((c) => c.ERBComponent),
    children: [
      // Role-based pages
      {
        path: 'hr',
        loadComponent: () =>
          import('./modules/layouts/hr/hr/hr').then((m) => m.Hr),
        title: 'HR',
      },
      {
        path: 'ceo',
        loadComponent: () =>
          import('./modules/layouts/ceo/ceo/ceo.component').then(
            (m) => m.CeoComponent
          ),
        title: 'CEO',
      },
      {
        path: 'cfo',
        loadComponent: () =>
          import('./modules/layouts/cfo/cfo/cfo.component').then(
            (m) => m.CfoComponent
          ),
        title: 'CFO',
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./modules/layouts/admin/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
        title: 'Admin',
      },
      {
        path: 'employee',
        loadComponent: () =>
          import('./modules/layouts/employee/employee/employee.component').then(
            (m) => m.EmployeeComponent
          ),
        title: 'Employee',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./modules/ERBSystem/products/products.component').then(
            (m) => m.ProductsComponent
          ),
        title: 'Products',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./modules/ERBSystem/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
        title: 'Categories',
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

  // Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./modules/NotFound/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
