import { provideToastr } from 'ngx-toastr';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHighcharts } from 'highcharts-angular';
import { provideRouter, provideRoutes } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { errInterceptor } from './core/interceptors/Errors/err-interceptor';
import { headerInterceptor } from './core/interceptors/Headers/header-interceptor';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/cache';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers

    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const platformId = inject(PLATFORM_ID);


      const uri = isPlatformBrowser(platformId)
        ? 'https://erplocal.runasp.net/GraphQl/'
        : 'hhttps://erplocal.runasp.net/GraphQl/';
      return {
        link: httpLink.create({ uri }),
        cache: new InMemoryCache(),
        ssrMode: !isPlatformBrowser(platformId),
      };
    }),


    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    MessageService,
    provideHttpClient(withFetch()
      , withInterceptors([errInterceptor, headerInterceptor])),
    provideHighcharts(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
  ],
};