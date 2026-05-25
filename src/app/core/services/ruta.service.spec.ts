import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RutaService } from './ruta.service';
import { RutaAdminResponse, RutaResponse } from '../models/ruta.models';

const API = 'http://localhost:8080/api/rutas';

describe('RutaService', () => {
  let service: RutaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RutaService, provideHttpClient(), provideHttpClientTesting()],
    });
    service  = TestBed.inject(RutaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── Público ────────────────────────────────────────────────────────────────

  it('listarActivas hace GET /api/rutas/public', () => {
    const mockRutas: RutaResponse[] = [
      { id: 1, nombre: 'Ruta Bosque', precio: 50000, descripcion: 'Desc',
        dificultad: 'MEDIA', duracionMinutos: 60 },
    ];

    service.listarActivas().subscribe((rutas) => {
      expect(rutas.length).toBe(1);
      expect(rutas[0].nombre).toBe('Ruta Bosque');
    });

    const req = httpMock.expectOne(`${API}/public`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRutas);
  });

  it('getRuta hace GET /api/rutas/public/:id', () => {
    const mockRuta: RutaResponse = {
      id: 5, nombre: 'Ruta Río', precio: 75000, descripcion: 'Desc',
      dificultad: 'FACIL', duracionMinutos: 90,
    };

    service.getRuta(5).subscribe((r) => expect(r.id).toBe(5));

    const req = httpMock.expectOne(`${API}/public/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRuta);
  });

  // ── Admin ─────────────────────────────────────────────────────────────────

  it('crear hace POST /api/rutas con el payload correcto', () => {
    const payload = {
      nombre: 'Nueva', descripcion: 'Desc', precio: 60000,
      dificultad: 'MEDIA' as const, duracionMinutos: 90,
    };
    const mockResp: RutaAdminResponse = { ...payload, id: 10, urlImagen: undefined, activa: true };

    service.crear(payload).subscribe((r) => {
      expect(r.id).toBe(10);
      expect(r.activa).toBeTrue();
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResp);
  });

  it('listarAdmin hace GET con query params de página y filtros', () => {
    service.listarAdmin({ page: 1, size: 10, activa: true, search: 'bosque' })
      .subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('activa')).toBe('true');
    expect(req.request.params.get('search')).toBe('bosque');
    req.flush({ content: [], totalElements: 0, totalPages: 0, number: 1, size: 10 });
  });

  it('listarAdmin sin filtros no incluye param activa', () => {
    service.listarAdmin({}).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.has('activa')).toBeFalse();
    req.flush({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });
  });

  it('obtenerAdmin hace GET /api/rutas/:id', () => {
    service.obtenerAdmin(3).subscribe();

    const req = httpMock.expectOne(`${API}/3`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 3, nombre: 'R', activa: true });
  });

  it('actualizar hace PUT /api/rutas/:id', () => {
    const payload = {
      nombre: 'Upd', descripcion: 'D', precio: 80000,
      dificultad: 'DIFICIL' as const, duracionMinutos: 120,
    };

    service.actualizar(3, payload).subscribe();

    const req = httpMock.expectOne(`${API}/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload, id: 3, activa: true });
  });

  it('toggleActiva hace PATCH /api/rutas/:id/estado con param activa', () => {
    service.toggleActiva(3, false).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/3/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.params.get('activa')).toBe('false');
    req.flush({ id: 3, activa: false });
  });

  it('eliminar hace DELETE /api/rutas/:id', () => {
    service.eliminar(3).subscribe();

    const req = httpMock.expectOne(`${API}/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});