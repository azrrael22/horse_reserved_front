import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReservaService } from './reserva.service';

const API = 'http://localhost:8080/api/reservaciones';

describe('ReservaService', () => {
  let service: ReservaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReservaService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReservaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('obtenerHorariosDisponibles hace GET con query params obligatorios', () => {
    service.obtenerHorariosDisponibles(1, '2026-06-01', 2).subscribe((response) => {
      expect(response.horariosDisponibles.length).toBe(1);
      expect(response.horariosDisponibles[0].horaInicio).toBe('08:30:00');
    });

    const req = httpMock.expectOne((r) => r.url === `${API}/horarios-disponibles`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('rutaId')).toBe('1');
    expect(req.request.params.get('fecha')).toBe('2026-06-01');
    expect(req.request.params.get('cantPersonas')).toBe('2');
    expect(req.request.params.has('reservaIdActual')).toBeFalse();
    req.flush({
      rutaId: 1,
      fecha: '2026-06-01',
      cantPersonasEvaluadas: 2,
      horariosDisponibles: [{ horaInicio: '08:30:00', horaFin: '09:30:00', cuposDisponibles: 4 }],
    });
  });

  it('obtenerHorariosDisponibles incluye reservaIdActual cuando se edita', () => {
    service.obtenerHorariosDisponibles(1, '2026-06-01', 2, 99).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/horarios-disponibles`);
    expect(req.request.params.get('reservaIdActual')).toBe('99');
    req.flush({ rutaId: 1, fecha: '2026-06-01', cantPersonasEvaluadas: 2, horariosDisponibles: [] });
  });
});
