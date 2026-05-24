import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CabalgataProgresoResponse, PageResponse, ProgresoParams } from '../models/ruta.models';

@Injectable({ providedIn: 'root' })
export class ProgresoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/rutas`;

  getProgresoGlobal(
    params: ProgresoParams = {}
  ): Observable<PageResponse<CabalgataProgresoResponse>> {
    return this.http.get<PageResponse<CabalgataProgresoResponse>>(
      `${this.apiUrl}/salidas/progreso`,
      { params: this.buildParams(params) }
    );
  }

  getProgresoPorRuta(
    rutaId: number,
    params: ProgresoParams = {}
  ): Observable<PageResponse<CabalgataProgresoResponse>> {
    return this.http.get<PageResponse<CabalgataProgresoResponse>>(
      `${this.apiUrl}/${rutaId}/salidas/progreso`,
      { params: this.buildParams(params) }
    );
  }

  private buildParams(params: ProgresoParams): HttpParams {
    return new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20))
      .set('sort', params.sort ?? 'fechaProgramada,desc');
  }
}