import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, filter, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CrearPreferenciaMpRequest,
  IntentoPagoResponse,
  PreferenciaMpResponse,
} from '../models/pago.models';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/pagos/mp`;

  crearPreferencia(req: CrearPreferenciaMpRequest): Observable<PreferenciaMpResponse> {
    return this.http.post<PreferenciaMpResponse>(`${this.apiUrl}/preferencia`, req);
  }

  consultarEstado(intentoId: number): Observable<IntentoPagoResponse> {
    return this.http.get<IntentoPagoResponse>(`${this.apiUrl}/estado/${intentoId}`);
  }

  asociarPaymentId(intentoId: number, mpPaymentId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/asociar-payment`, null, {
      params: { intentoId: intentoId.toString(), mpPaymentId },
    });
  }

  // Polling: consulta cada 3s hasta que el estado ya no sea PENDIENTE (máx ~2 min)
  esperarConfirmacion(intentoId: number): Observable<IntentoPagoResponse> {
    return interval(3000).pipe(
      switchMap(() => this.consultarEstado(intentoId)),
      filter((res) => res.estado !== 'PENDIENTE'),
      take(1)
    );
  }
}
