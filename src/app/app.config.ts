import { provideToastr } from 'ngx-toastr';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHighcharts } from 'highcharts-angular';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpHeaders, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { errInterceptor } from './core/interceptors/Errors/err-interceptor';
import { headerInterceptor } from './core/interceptors/Headers/header-interceptor';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/cache';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { setContext } from '@apollo/client/link/context';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideToastr(),

    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const platformId = inject(PLATFORM_ID);

      const uri = isPlatformBrowser(platformId)
        ? 'https://erplocal.runasp.net/GraphQl/'
        : 'https://erplocal.runasp.net/GraphQl/';

      const authLink = setContext((_, { headers }) => {
        const token = isPlatformBrowser(platformId)
          ? localStorage.getItem('accessToken')
          : null;

        return {
          headers: new HttpHeaders({
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          })
        };
      });

      return {
        link: authLink.concat(httpLink.create({ uri })),
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
    provideHttpClient(
      withFetch(),
      withInterceptors([errInterceptor, headerInterceptor])
    ),
    provideHighcharts(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
  ],
};