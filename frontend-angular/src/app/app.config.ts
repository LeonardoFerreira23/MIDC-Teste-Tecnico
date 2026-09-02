import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

// Em Angular standalone o HttpClient precisa ser provido aqui.
// Sem esta linha, injetar HttpClient em qualquer service quebra em runtime.
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],
};