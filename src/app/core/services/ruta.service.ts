import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RutaResponse } from '../models/ruta.models';
import { CreateRutaRequest, RutaAdminResponse, RutaAdminParams, UpdateRutaRequest } from '../models/ruta.models';
import { PageResponse } from '../models/ruta.models';

@Injectable({ providedIn: 'root' })
export class RutaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/rutas`;

  listarActivas(): Observable<RutaResponse[]> {
    return this.http.get<RutaResponse[]>(`${this.apiUrl}/public`);
  }

  getRuta(id: number): Observable<RutaResponse> {
    return this.http.get<RutaResponse>(`${this.apiUrl}/public/${id}`);
  }

   //Admin

  crear(payload: CreateRutaRequest): Observable<RutaAdminResponse> {
    return this.http.post<RutaAdminResponse>(this.apiUrl, payload);
  }

  listarAdmin(params: RutaAdminParams = {}): Observable<PageResponse<RutaAdminResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 10))
      .set('sort', params.sort ?? 'nombre,asc');

    if (params.activa !== undefined) {
      httpParams = httpParams.set('activa', String(params.activa));
    }
    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    return this.http.get<PageResponse<RutaAdminResponse>>(this.apiUrl, { params: httpParams });
  }

  obtenerAdmin(id: number): Observable<RutaAdminResponse> {
    return this.http.get<RutaAdminResponse>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: number, payload: UpdateRutaRequest): Observable<RutaAdminResponse> {
    return this.http.put<RutaAdminResponse>(`${this.apiUrl}/${id}`, payload);
  }

  toggleActiva(id: number, activa: boolean): Observable<RutaAdminResponse> {
    const params = new HttpParams().set('activa', String(activa));
    return this.http.patch<RutaAdminResponse>(`${this.apiUrl}/${id}/estado`, null, { params });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
