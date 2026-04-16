import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirect root to login
  { path: '', redirectTo: 'admin-login', pathMatch: 'full' },

  //ai agent
  {
    path: 'Alexa',
    loadComponent: () => import('./modules/Ai agent/ai/ai.component').then((c) => c.AiComponent),
    title: 'Alexa',
  },
  // Auth Layout
  {
    path: '',
    loadComponent: () => import('./core/layout/auth/auth.component').then((c) => c.AuthComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./modules/Auth/login/login.component').then((c) => c.LoginComponent),
        title: 'Login',
      },
      {
        path: 'register',
        loadComponent: () => import('./modules/Auth/register/register.component').then((c) => c.RegisterComponent),
        title: 'Register',
      },
      {
        path: 'forget-password',
        loadComponent: () => import('./modules/Auth/forget-password/forget-password.component').then((c) => c.ForgetPasswordComponent),
        title: 'Forget Password',
      },
      {
        path: 'verification',
        loadComponent: () => import('./modules/Auth/otp/otp.component').then((c) => c.OTPComponent),
        title: 'Verification',
      },
    ],
  },

  // ERB Layout 
  {
    path: '',
    loadComponent: () => import('./core/layout/erb/erb.component').then((c) => c.ERBComponent),
    children: [

      {
        path: 'admin',
        loadComponent: () => import('./modules/ERBSystem/admin/admin.component').then((m) => m.AdminComponent),
        title: 'Admin',
      },
      {
        path: 'employee',
        loadComponent: () => import('./modules/ERBSystem/employee/employee.component').then((m) => m.EmployeeComponent),
        title: 'Employee',
      },
      {
        path: 'products',
        loadComponent: () => import('./modules/ERBSystem/Prodects/products/products.component').then((m) => m.ProductsComponent),
        title: 'Products',
      },
      {
        path: 'AddProduect',
        loadComponent: () => import('./modules/ERBSystem/Prodects/add-produect/add-produect.component').then((a) => a.AddProduectComponent),
        title: 'AddProduect',
      },
      {
        path: 'Edite-Produect/:id',
        loadComponent: () =>
          import(
            './modules/ERBSystem/Prodects/edite-produect/edite-produect.component'
          ).then((E) => E.EditeProduectComponent),
        title: 'EditeProduect',
      },
      {
        path: 'categories',
        loadComponent: () => import('./modules/ERBSystem/categories/categories.component').then((m) => m.CategoriesComponent),
        title: 'Categories',
      },
      {
        path: 'new-category',
        loadComponent: () => import('./modules/ERBSystem/new-category/new-category.component').then((m) => m.NewCategoryComponent),
        title: 'New Category',
      },
    ],
  },
  // E-Commerce Layout
  {
    path: '',
    loadComponent: () => import('./core/layout/e-commerc/e-commerc.component').then((e) => e.ECommercComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./modules/E-Commerce/home/home.component').then((h) => h.HomeComponent),
        title: 'Home',
      },
      {
        path: 'product',
        loadComponent: () => import('./modules/E-Commerce/product-details/product-details.component').then((m) => m.ProductDetailsComponent),
        title: 'Product',
      }, //Demo
      {
        path: 'product/:id',
        loadComponent: () => import('./modules/E-Commerce/product-details/product-details.component').then((m) => m.ProductDetailsComponent),
        title: 'Product-Details',
      },

      {
        path: 'cart',
        loadComponent: () => import('./modules/E-Commerce/cart/cart.component').then((m) => m.CartComponent),
        title: 'Cart',
      },
      {
        path: 'Profile',
        loadComponent: () => import('./modules/E-Commerce/personal-information/personal-information.component').then((p) => p.PersonalInformationComponent),
        title: 'Profile',
      },

      {
        path: 'security',
        loadComponent: () => import('./modules/E-Commerce/security/security.component').then((s) => s.SecurityComponent),
        title: 'Security',
      },
      {
        path: 'help-support',
        loadComponent: () => import('./modules/E-Commerce/help-support/help-support.component').then((m) => m.HelpSupportComponent),
        title: 'Help-Support',
      },
    ],
  },
  // HR Layout
  {
    path: '',
    loadComponent: () => import('./core/layout/hr/hr.component').then((H) => H.HRComponent),
    children: [
      {
        path: 'usermanagemant',
        loadComponent: () => import('./modules/ERBSystem/HR/usermanagemant/usermanagemant.component').then((U) => U.UsermanagemantComponent),
        title: 'usermanagemant',
      },
      {
        path: 'assign-roles',
        loadComponent: () => import('./modules/ERBSystem/HR/assign-roles-to-user/assign-roles-to-user.component').then((A) => A.AssignRolesToUserComponent),
        title: 'assign-roles',
      },
      {
        path: 'manage-role',
        loadComponent: () => import('./modules/ERBSystem/HR/manage-role-permissions/manage-role-permissions.component').then((M) => M.ManageRolePermissionsComponent),
        title: 'manage-role',
      },
      {
        path: 'hrapprovals',
        loadComponent: () => import('./modules/ERBSystem/HR/manager-hrapprovals/manager-hrapprovals.component').then((m) => m.ManagerHRApprovalsComponent),
        title: 'hrapprovals',
      },
      {
        path: 'permission',
        loadComponent: () => import('./modules/ERBSystem/HR/permissionmanagement/permissionmanagement.component').then((P) => P.PermissionmanagementComponent),
        title: 'permissionmanagement',
      },
      {
        path: 'create-permission',
        loadComponent: () => import('./modules/ERBSystem/HR/create-permission/create-permission/create-permission.component').then((R) => R.CreatePermissionComponent)
      },
      {
        path: 'permission-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/permission-details/permission-details/permission-details.component').then((d) => d.PermissionDetailsComponent)
      },
      {
        path: 'super-admin',
        loadComponent: () => import('./modules/ERBSystem/HR/super-admin-overview/super-admin-overview.component').then((m) => m.SuperAdminOverviewComponent),
        title: 'super-admin',
      },
      {
        path: 'developer',
        loadComponent: () => import('./modules/ERBSystem/AdminDashboard/developer/developer.component').then((m) => m.DeveloperComponent),
        title: 'developer',
      },
      {
        path: 'rolemanagement',
        loadComponent: () => import('./modules/ERBSystem/HR/rolemanagement/rolemanagement.component').then((R) => R.RolemanagementComponent),
        title: 'rolemanagement',
      },
      {
        path: 'role-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/role-details/role-details/role-details.component').then((L) => L.RoleDetailsComponent)
      },
      {
        path: 'hr-Overview',
        loadComponent: () => import('./modules/ERBSystem/HR/hr-overview/hr-overview.component').then((H) => H.HrOverviewComponent),
        title: 'hr-Overview'
      },
      {
        path: 'employee-management',
        loadComponent: () => import('./modules/ERBSystem/HR/employee-management-page/employee-management-page.component').then((E) => E.EmployeeManagementPageComponent),
        title: 'employee-management'
      },
      {
        path: 'department-management',
        loadComponent: () => import('./modules/ERBSystem/HR/department-management/department-management.component').then((D) => D.DepartmentManagementComponent),
        title: 'Department-management'
      },
      {
        path: 'job-management',
        loadComponent: () => import('./modules/ERBSystem/HR/jop-management/jop-management/jop-management.component').then((J) => J.JopManagementComponent),
        title: 'job-management'
      },
      {
        path: 'candidate-management',
        loadComponent: () => import('./modules/ERBSystem/HR/candidate-management/candidate-management.component').then((C) => C.CandidateManagementComponent),
        title: 'candidate-management'
      },
      {
        path: 'add-new-employee',
        loadComponent: () => import('./modules/ERBSystem/HR/add-new-employee/add-new-employee.component').then((A) => A.AddNewEmployeeComponent),
        title: 'add-new-employee',
      },
      {
        path: 'edit-employee',
        loadComponent: () => import('./modules/ERBSystem/HR/edit-employee-info/edit-employee-info.component').then((E) => E.EditEmployeeInfoComponent),
        title: 'edit-employee'
      },
      {
        path: 'add-new-department',
        loadComponent: () => import('./modules/ERBSystem/HR/add-new-departyment/add-new-departyment.component').then((A) => A.AddNewDepartymentComponent),
        title: 'add-new-department',
      },
      {
        path: 'view-application-details',
        loadComponent: () => import('./modules/ERBSystem/HR/view-application-details/view-application-details.component').then((V) => V.ViewApplicationDetailsComponent),
        title: 'view-application-details'
      },
      {
        path: 'new-contract-page',
        loadComponent: () => import('./modules/ERBSystem/HR/add-new-contract/add-new-contract.component').then((N) => N.AddNewContractComponent),
        title: 'new-contract-page'
      },
      {
        path: 'edit-contract-page',
        loadComponent: () => import('./modules/ERBSystem/HR/edit-contract-page/edit-contract-page.component').then((E) => E.EditContractPageComponent),
        title: 'edit-contract-page'
      },

      {
        path: 'admin-dashboard',
        loadComponent: () => import('./modules/ERBSystem/AdminDashboard/admin-dash/admin-dash.component').then((A) => A.AdminDashComponent),
        title: 'admin-dashboard',
      },
      {
        path: 'permissions',
        loadComponent: () => import('./modules/ERBSystem/HR/Permissions/permission/permission.component').then((P) => P.PermissionComponent)
      },
      {
        path: 'role-mangement',
        loadComponent: () => import('./modules/ERBSystem/HR/rolemanagement/rolemanagement.component').then((C) => C.RolemanagementComponent),
        title: 'role-mangement'
      },
      {
        path: 'create-role',
        loadComponent: () => import('./modules/ERBSystem/HR/create-role/create-role/create-role.component').then((r) => r.CreateRoleComponent)
      },
      {
        path: 'log-detail/:id',
        loadComponent: () => import('./modules/ERBSystem/AdminDashboard/log-detail/log-detail.component').then((L) => L.LogDetailComponent),
        title: 'log-detail'
      },
      {
        path: 'system-logs',
        loadComponent: () => import('./modules/ERBSystem/AdminDashboard/system-logs/system-logs.component').then((S) => S.SystemLogsComponent),
        title: 'system-logs'
      },
      {
        path: 'user-management',
        loadComponent: () => import('./modules/ERBSystem/AdminDashboard/user-management/user-management.component').then((U) => U.UserManagementComponent),
        title: 'user-management'
      },
      {
        path: 'admin-login',
        loadComponent: () => import('./modules/ERBSystem/AdminDashboard/admin-login/admin-login.component').then((A) => A.AdminLoginComponent),
        title: 'admin-login'
      },
      {
        path: 'sales-analysis',
        loadComponent: () => import('./modules/ERBSystem/Sales/sales-analysis/sales-analysis.component').then((S) => S.SalesAnalysisComponent),
        title: 'sales-analysis'
      },
      {
        path: 'category-management',
        loadComponent: () => import('./modules/ERBSystem/Sales/category-mangement/category-mangement.component').then((C) => C.CategoryMangementComponent),
        title: 'category-management'
      },
      {
        path: 'category-details/:id',
        loadComponent: () => import('./modules/ERBSystem/Sales/category-detail/category-detail.component').then((C) => C.CategoryDetailComponent),
        title: 'category-details'
      },
      {
        path: 'product-management',
        loadComponent: () => import('./modules/ERBSystem/Sales/product-mangement/product-mangement.component').then((P) => P.ProductMangementComponent),
        title: 'product-management'
      },
      {
        path: 'product-details/:id',
        loadComponent: () => import('./modules/ERBSystem/Sales/product-details/product-details/product-details.component').then((S) => S.ProductDetailsComponent)
      },
      {
        path: 'add-product',
        loadComponent: () => import('./modules/ERBSystem/Sales/add-product/add-product.component').then((A) => A.AddProductComponent),
        title: 'add-product'
      },
      {
        path: 'view-product/:id',
        loadComponent: () => import('./modules/ERBSystem/Sales/veiw-product/veiw-product.component').then((V) => V.VeiwProductComponent),
        title: 'view-product'
      },
      {
        path: 'discount-management',
        loadComponent: () => import('./modules/ERBSystem/HR/Discount/discount-mangement/discount-mangement.component').then((D) => D.DiscountMangementComponent),
        title: 'discount-management'
      },
      {
        path: 'create-discount',
        loadComponent: () => import('./modules/ERBSystem/HR/Discount/creat-discount/creat-discount.component').then((C) => C.CreatDiscountComponent),
        title: 'create-discount'
      },
      {
        path: 'create-target',
        loadComponent: () => import('./modules/ERBSystem/HR/Discount/create-target/create-target.component').then((C) => C.CreateTargetComponent),
        title: 'create-target'
      },
      {
        path: 'discount-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/Discount/discount-details/discount-details.component').then((D) => D.DiscountDetailsComponent),
        title: 'discount-details'
      },
      {
        path: 'orders',
        loadComponent: () => import('./modules/ERBSystem/Sales/orders/orders.component').then((O) => O.OrdersComponent)
      },
      {
        path: 'warehouse-management',
        loadComponent: () => import('./modules/ERBSystem/HR/warehouse-managment/warehouse-managment/warehouse-managment.component').then((W) => W.WarehouseManagmentComponent)
      },
      {
        path: 'warehouse-details',
        loadComponent: () => import('./modules/ERBSystem/HR/warehouse-details/warehouse-details/warehouse-details.component').then((D) => D.WarehouseDetailsComponent)
      },
      //هنا البدايه 
      {
        path: 'hr-dashboard',
        loadComponent: () => import('./modules/ERBSystem/HR/HR-Dashboard/hr-dashboard/hr-dashboard.component').then((H) => H.HrDashboardComponent)
      },
      {
        path: 'hr-department',
        loadComponent: () => import('./modules/ERBSystem/HR/HR-Department/hr-department/hr-department.component').then((D) => D.HrDepartmentComponent)
      },
      {
        path: 'department-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/HR-DepartmentDetails/department-details/department-details.component').then((D) => D.DepartmentDetailsComponent)
      },
      {
        path: 'add-department',
        loadComponent: () => import('./modules/ERBSystem/HR/Add-Department/add-department//add-department.component').then((A) => A.AddDepartmentComponent)
      },
      {
        path: 'update-department',
        loadComponent: () => import('./modules/ERBSystem/HR/update-department/update-department/update-department.component').then((U) => U.UpdateDepartmentComponent)
      },
      {
        path: 'employee-managment',
        loadComponent: () => import('./modules/ERBSystem/HR/employee-management/employee-management/employee-management.component').then((E) => E.EmployeeManagementComponent)
      },
      {
        path: 'employee-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/employee-details/employee-details/employee-details.component').then((E) => E.EmployeeDetailsComponent)
      },
      {
        path: 'add-employee',
        loadComponent: () => import('./modules/ERBSystem/HR/add-employee/add-employee/add-employee.component').then((E) => E.AddEmployeeComponent)
      },
      {
        path: 'ubdate-employee',
        loadComponent: () => import('./modules/ERBSystem/HR/ubdate-employee/ubdate-employee/ubdate-employee.component').then((E) => E.UbdateEmployeeComponent)
      },
      {
        path: 'payroll-management',
        loadComponent: () => import('./modules/ERBSystem/HR/payroll-management/payroll-management/payroll-management.component').then((P) => P.PayrollManagementComponent)
      },
      {
        path: 'payroll-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/payroll-details/payroll-details/payroll-details.component').then((P) => P.PayrollDetailsComponent)
      },

      {
        path: 'add-jop',
        loadComponent: () => import('./modules/ERBSystem/HR/Add-Jop/add-jop/add-jop.component').then((J) => J.AddJopComponent)
      },
      {
        path: 'update-jop',
        loadComponent: () => import('./modules/ERBSystem/HR/update-jop/update-jop/update-jop.component').then((U) => U.UpdateJopComponent)
      },
      {
        path: 'jop-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/jop-details/jop-details/jop-details.component').then((J) => J.JopDetailsComponent)
      },
      {
        path: 'Candidate-Management',
        loadComponent: () => import('./modules/ERBSystem/HR/candidate-management/candidate-management.component').then((C) => C.CandidateManagementComponent)
      },
      {
        path: 'add-candidate',
        loadComponent: () => import('./modules/ERBSystem/HR/Add-Candidate/add-candidate/add-candidate.component').then((C) => C.AddCandidateComponent)
      },
      {
        path: 'candidate-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/Candidate-Details/candidate-details/candidate-details.component').then((D) => D.CandidateDetailsComponent)
      },
      {
        path: 'application-management',
        loadComponent: () => import('./modules/ERBSystem/HR/Application-management/application-management/application-management.component').then((A) => A.ApplicationManagementComponent)
      },
      {
        path: 'application-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/Application-details/application-details/application-details.component').then((A) => A.ApplicationDetailsComponent)
      },
      {
        path: 'add-application',
        loadComponent: () => import('./modules/ERBSystem/HR/Add-Applications/add-application/add-application.component').then((A) => A.AddApplicationComponent)
      },
      {
        path: 'schedule-interview',
        loadComponent: () => import('./modules/ERBSystem/HR/Schedule -Interview/schedule-interview/schedule-interview.component').then((S) => S.ScheduleInterviewComponent)
      },
      {
        path: 'interview-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/interview-details/interview-details/interview-details.component').then((I) => I.InterviewDetailsComponent)
      },
      {
        path: 'interview-management',
        loadComponent: () => import('./modules/ERBSystem/HR/interview-management/interview-management/interview-management.component').then((I) => I.InterviewManagementComponent)
      },
      {
        path: 'offer-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/offer-details/offer-details/offer-details.component').then((O) => O.OfferDetailsComponent)
      },
      {
        path: 'add-offer',
        loadComponent: () => import('./modules/ERBSystem/HR/Add-Offer/add-offer/add-offer.component').then((O) => O.AddOfferComponent)
      },
      {
        path: 'offer-management',
        loadComponent: () => import('./modules/ERBSystem/HR/offer-management/offer-management/offer-management.component').then((O) => O.OfferManagementComponent)
      },
      {
        path: 'contract-management',
        loadComponent: () => import('./modules/ERBSystem/HR/contract-management/contract-management.component').then((C) => C.ContractManagementComponent),
        title: 'contract-management'
      },
      {
        path: 'contract-details/:id',
        loadComponent: () => import('./modules/ERBSystem/HR/contract-details/contract-details/contract-details.component').then((C) => C.ContractDetailsComponent),
        title: 'contract-management'
      },
      {
        path: 'add-contract',
        loadComponent: () => import('./modules/ERBSystem/HR/add-contract/add-contract/add-contract.component').then((C) => C.AddContractComponent),
        title: 'contract-management'
      },
      {
        path: 'update-contract',
        loadComponent: () => import('./modules/ERBSystem/HR/update-contract/update-contract/update-contract.component').then((C) => C.UpdateContractComponent),
        title: 'contract-management'
      },
      {
        path: 'attendance-dashboard',
        loadComponent: () => import('./modules/ERBSystem/HR/Attendance-dashboard/attendance-dashboard/attendance-dashboard.component').then((A) => A.AttendanceDashboardComponent)
      }
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
