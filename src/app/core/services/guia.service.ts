import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GuiaRequest, GuiaResponse } from '../models/recurso.models';

@Injectable({ providedIn: 'root' })
export class GuiaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/guias`;

  listar(activos?: boolean): Observable<GuiaResponse[]> {
    const params: Record<string, string> =
      activos !== undefined ? { activos: String(activos) } : {};
    return this.http.get<GuiaResponse[]>(this.apiUrl, { params });
  }

  obtener(id: number): Observable<GuiaResponse> {
    return this.http.get<GuiaResponse>(`${this.apiUrl}/${id}`);
  }

  crear(dto: GuiaRequest): Observable<GuiaResponse> {
    return this.http.post<GuiaResponse>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: GuiaRequest): Observable<GuiaResponse> {
    return this.http.put<GuiaResponse>(`${this.apiUrl}/${id}`, dto);
  }

  cambiarEstado(id: number, activo: boolean): Observable<GuiaResponse> {
    return this.http.patch<GuiaResponse>(
      `${this.apiUrl}/${id}/estado`,
      {},
      { params: { activo: String(activo) } }
    );
  }
}
