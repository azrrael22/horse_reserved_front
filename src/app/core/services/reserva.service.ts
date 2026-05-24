import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateReservaRequest,
  HorariosDisponiblesResponse,
  UpdateReservaRequest,
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

  listarTodas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(this.apiUrl);
  }

  obtenerReservaPorId(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${this.apiUrl}/${id}`);
  }

  actualizarReserva(id: number, req: UpdateReservaRequest): Observable<ReservaResponse> {
    return this.http.patch<ReservaResponse>(`${this.apiUrl}/${id}`, req);
  }

  cancelarReserva(id: number): Observable<ReservaResponse> {
    return this.http.patch<ReservaResponse>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  obtenerHorariosDisponibles(
    rutaId: number,
    fecha: string,
    cantPersonas: number,
    reservaIdActual?: number
  ): Observable<HorariosDisponiblesResponse> {
    let params = new HttpParams()
      .set('rutaId', rutaId)
      .set('fecha', fecha)
      .set('cantPersonas', cantPersonas);

    if (reservaIdActual !== undefined) {
      params = params.set('reservaIdActual', reservaIdActual);
    }

    return this.http.get<HorariosDisponiblesResponse>(`${this.apiUrl}/horarios-disponibles`, { params });
  }
}
