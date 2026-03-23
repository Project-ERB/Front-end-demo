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
    renderMode: RenderMode.Server
  },

  // All other routes use Prerender
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
