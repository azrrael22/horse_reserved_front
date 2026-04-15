import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CaballoRequest, CaballoResponse } from '../models/recurso.models';

@Injectable({ providedIn: 'root' })
export class CaballoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/caballos`;

  listar(activos?: boolean): Observable<CaballoResponse[]> {
    const params: Record<string, string> =
      activos !== undefined ? { activos: String(activos) } : {};
    return this.http.get<CaballoResponse[]>(this.apiUrl, { params });
  }

  obtener(id: number): Observable<CaballoResponse> {
    return this.http.get<CaballoResponse>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CaballoRequest): Observable<CaballoResponse> {
    return this.http.post<CaballoResponse>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: CaballoRequest): Observable<CaballoResponse> {
    return this.http.put<CaballoResponse>(`${this.apiUrl}/${id}`, dto);
  }

  cambiarEstado(id: number, activo: boolean): Observable<CaballoResponse> {
    return this.http.patch<CaballoResponse>(
      `${this.apiUrl}/${id}/estado`,
      {},
      { params: { activo: String(activo) } }
    );
  }
}
