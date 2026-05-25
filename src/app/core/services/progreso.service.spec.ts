import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProgresoService } from './progreso.service';

const API = 'http://localhost:8080/api/rutas';

describe('ProgresoService', () => {
  let service: ProgresoService;
  let httpMock: HttpTestingController;

  const mockPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProgresoService, provideHttpClient(), provideHttpClientTesting()],
    });
    service  = TestBed.inject(ProgresoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getProgresoGlobal hace GET /api/rutas/salidas/progreso', () => {
    service.getProgresoGlobal().subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/salidas/progreso`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    req.flush(mockPage);
  });

  it('getProgresoGlobal respeta params de paginación', () => {
    service.getProgresoGlobal({ page: 2, size: 5 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/salidas/progreso`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('5');
    req.flush(mockPage);
  });

  it('getProgresoPorRuta hace GET /api/rutas/:id/salidas/progreso', () => {
    service.getProgresoPorRuta(7).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/7/salidas/progreso`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('getProgresoPorRuta respeta rutaId en la URL', () => {
    service.getProgresoPorRuta(42, { page: 0 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/42/salidas/progreso`);
    expect(req.request.url).toContain('/42/');
    req.flush(mockPage);
  });
});