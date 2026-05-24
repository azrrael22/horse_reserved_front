import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MetricasGananciasResponse,
  MetricasPagosResponse,
  RangoMetrica,
} from '../models/admin-stats.models';

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getGanancias(
    rango: RangoMetrica,
    desde: string,
    hasta: string,
  ): Observable<MetricasGananciasResponse> {
    const params = new HttpParams()
      .set('rango', rango)
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<MetricasGananciasResponse>(
      `${this.baseUrl}/api/admin/metricas/ganancias`,
      { params },
    );
  }

  getMetricasPagos(desde: string, hasta: string): Observable<MetricasPagosResponse> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<MetricasPagosResponse>(
      `${this.baseUrl}/api/pagos/metricas`,
      { params },
    );
  }
}
