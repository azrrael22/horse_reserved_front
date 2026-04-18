import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuditLogFiltro,
  AuditLogResponse,
  PageResponse,
} from '../models/audit-log.models';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/admin/audit-logs`;

  listar(filtro: AuditLogFiltro): Observable<PageResponse<AuditLogResponse>> {
    let params = new HttpParams()
      .set('page', String(filtro.page))
      .set('size', String(filtro.size));

    if (filtro.categoria) params = params.set('categoria', filtro.categoria);
    if (filtro.usuarioEmail) params = params.set('usuarioEmail', filtro.usuarioEmail);
    if (filtro.resultado) params = params.set('resultado', filtro.resultado);
    if (filtro.desde) params = params.set('desde', filtro.desde);
    if (filtro.hasta) params = params.set('hasta', filtro.hasta);

    return this.http.get<PageResponse<AuditLogResponse>>(this.apiUrl, { params });
  }
}
