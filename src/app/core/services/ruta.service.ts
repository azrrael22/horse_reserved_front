import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RutaResponse } from '../models/ruta.models';

@Injectable({ providedIn: 'root' })
export class RutaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/rutas`;

  listarActivas(): Observable<RutaResponse[]> {
    return this.http.get<RutaResponse[]>(`${this.apiUrl}/public`);
  }
}
