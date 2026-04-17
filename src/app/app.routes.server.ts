import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'log-detail/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'category-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'view-product/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'discount-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'Edite-Produect/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'product/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'permission-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'role-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'product-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'employee-details/:id',   // ✅ أُضيفت هنا
    renderMode: RenderMode.Server,
  },
  {
    path: 'payroll-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'jop-details/:id',        // ✅ تم تصحيح الـ typo (كانت jop-details:/id)
    renderMode: RenderMode.Server,
  },
  {
    path: 'candidate-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'application-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'interview-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'offer-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'contract-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'department-details/:id', // ✅ أُضيفت هنا
    renderMode: RenderMode.Server,
  },
  {
    path: 'Developer-Details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];