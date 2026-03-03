import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateReservaRequest,
  ReservaResponse,
} from '../models/reserva.models';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/reservaciones`;

  crearReserva(req: CreateReservaRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.apiUrl, req);
  }

  listarMisReservas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(`${this.apiUrl}/mias`);
  }

  obtenerReservaPorId(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${this.apiUrl}/${id}`);
  }

  cancelarReserva(id: number): Observable<ReservaResponse> {
    return this.http.patch<ReservaResponse>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}