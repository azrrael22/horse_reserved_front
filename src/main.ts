import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';

registerLocaleData(localeEsCO);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
