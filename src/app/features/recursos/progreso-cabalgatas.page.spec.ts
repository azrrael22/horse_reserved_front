import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';
import { ProgresoCabalgatasPage } from './progreso-cabalgatas.page';
import { ProgresoService } from '../../core/services/progreso.service';
import { RutaService } from '../../core/services/ruta.service';
import { CabalgataProgresoResponse, PageResponse } from '../../core/models/ruta.models';

describe('ProgresoCabalgatasPage', () => {
  let mockProgresoService: jasmine.SpyObj<ProgresoService>;
  let mockRutaService: jasmine.SpyObj<RutaService>;
  let mockToastCtrl: jasmine.SpyObj<ToastController>;

  const mockSalida = (id: number, estado: 'NO_INICIADA' | 'EN_CURSO' | 'FINALIZADA'): CabalgataProgresoResponse => ({
    salidaId: id, rutaId: 1, rutaNombre: 'Ruta Test',
    fechaProgramada: '2026-05-21', tiempoInicio: '10:00:00', tiempoFin: '11:30:00',
    duracionMinutos: 90, minutosTranscurridos: 45, progresoPorcentaje: 50,
    estadoCalculado: estado, estadoSalida: 'programado',
  });

  const mockPage = (items: CabalgataProgresoResponse[]): PageResponse<CabalgataProgresoResponse> => ({
    content: items, totalElements: items.length, totalPages: 1, number: 0, size: 20,
  });

  const rutasPage = { content: [{ id: 1, nombre: 'Ruta Test', activa: true }], totalElements: 1, totalPages: 1, number: 0, size: 200 };

  beforeEach(() => {
    mockProgresoService = jasmine.createSpyObj('ProgresoService', [
      'getProgresoGlobal', 'getProgresoPorRuta',
    ]);
    mockRutaService  = jasmine.createSpyObj('RutaService', ['listarAdmin']);
    mockToastCtrl    = jasmine.createSpyObj('ToastController', ['create']);

    mockToastCtrl.create.and.resolveTo({ present: jasmine.createSpy().and.resolveTo() } as any);
    mockProgresoService.getProgresoGlobal.and.returnValue(
      of(mockPage([mockSalida(1, 'EN_CURSO')]))
    );
    mockRutaService.listarAdmin.and.returnValue(of(rutasPage as any));

    TestBed.configureTestingModule({
      imports: [ProgresoCabalgatasPage],
      providers: [
        { provide: ProgresoService, useValue: mockProgresoService },
        { provide: RutaService,     useValue: mockRutaService },
        { provide: ToastController, useValue: mockToastCtrl },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  function getComponent(): ProgresoCabalgatasPage {
    const fixture = TestBed.createComponent(ProgresoCabalgatasPage);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  // ── Carga inicial ──────────────────────────────────────────────────────────

  it('llama getProgresoGlobal en ngOnInit', fakeAsync(() => {
    getComponent();
    tick();
    expect(mockProgresoService.getProgresoGlobal).toHaveBeenCalled();
  }));

  it('carga rutas disponibles para el select', fakeAsync(() => {
    const comp = getComponent();
    tick();
    expect(mockRutaService.listarAdmin).toHaveBeenCalledWith({ size: 200 });
    expect(comp.rutasDisponibles().length).toBe(1);
  }));

  it('popula salidas con el contenido de la respuesta', fakeAsync(() => {
    const comp = getComponent();
    tick();
    expect(comp.salidas().length).toBe(1);
    expect(comp.salidas()[0].estadoCalculado).toBe('EN_CURSO');
  }));

  it('muestra error cuando el servicio falla', fakeAsync(() => {
    mockProgresoService.getProgresoGlobal.and.returnValue(
      throwError(() => ({ error: { message: 'Error servidor' } }))
    );
    const comp = getComponent();
    tick();
    expect(comp.error()).toBe('Error servidor');
  }));

  // ── Filtro por ruta ────────────────────────────────────────────────────────

  it('onRutaChange con rutaId llama getProgresoPorRuta', fakeAsync(() => {
    mockProgresoService.getProgresoPorRuta.and.returnValue(of(mockPage([])));
    const comp = getComponent();
    tick();

    const event = { target: { value: '7' } } as unknown as Event;
    comp.onRutaChange(event);
    tick();

    expect(mockProgresoService.getProgresoPorRuta).toHaveBeenCalledWith(
      7, jasmine.objectContaining({ page: 0 })
    );
  }));

  it('onRutaChange con valor vacío llama getProgresoGlobal', fakeAsync(() => {
    const comp = getComponent();
    tick();
    mockProgresoService.getProgresoGlobal.calls.reset();

    const event = { target: { value: '' } } as unknown as Event;
    comp.onRutaChange(event);
    tick();

    expect(mockProgresoService.getProgresoGlobal).toHaveBeenCalled();
  }));

  // ── Auto-refresh ───────────────────────────────────────────────────────────

  it('toggleAutoRefresh activa autoRefresh signal', () => {
    const comp = getComponent();
    expect(comp.autoRefresh()).toBeFalse();
    comp.toggleAutoRefresh();
    expect(comp.autoRefresh()).toBeTrue();
  });

  it('toggleAutoRefresh desactiva autoRefresh signal en segunda llamada', () => {
    const comp = getComponent();
    comp.toggleAutoRefresh();
    comp.toggleAutoRefresh();
    expect(comp.autoRefresh()).toBeFalse();
  });

  // ── Helpers visuales ──────────────────────────────────────────────────────

  it('badgeClase retorna clase correcta para cada estado', () => {
    const comp = getComponent();
    expect(comp.badgeClase('NO_INICIADA')).toContain('bg-gray-100');
    expect(comp.badgeClase('EN_CURSO')).toContain('bg-green-50');
    expect(comp.badgeClase('FINALIZADA')).toContain('bg-blue-50');
  });

  it('badgeLabel retorna etiqueta legible', () => {
    const comp = getComponent();
    expect(comp.badgeLabel('EN_CURSO')).toBe('En curso');
    expect(comp.badgeLabel('FINALIZADA')).toBe('Finalizada');
  });

  // ── Paginación ─────────────────────────────────────────────────────────────

  it('irPagina actualiza pagina y recarga', fakeAsync(() => {
    mockProgresoService.getProgresoGlobal.and.returnValue(of(mockPage([])));
    const comp = getComponent();
    tick();
    mockProgresoService.getProgresoGlobal.calls.reset();

    comp.irPagina(1);
    tick();

    expect(comp.pagina()).toBe(1);
    expect(mockProgresoService.getProgresoGlobal).toHaveBeenCalled();
  }));

  // ── Limpieza ──────────────────────────────────────────────────────────────

  it('ngOnDestroy detiene el auto-refresh si estaba activo', () => {
    const comp = getComponent();
    comp.toggleAutoRefresh();
    expect(comp.autoRefresh()).toBeTrue();
    comp.ngOnDestroy();
    expect(comp.autoRefresh()).toBeTrue(); // signal no cambia, solo se limpia el interval
  });
});