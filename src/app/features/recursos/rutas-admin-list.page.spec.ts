import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { RutasAdminListPage } from './rutas-admin-list.page';
import { RutaService } from '../../core/services/ruta.service';
import { RutaAdminResponse, PageResponse } from '../../core/models/ruta.models';

describe('RutasAdminListPage', () => {
  let mockRutaService: jasmine.SpyObj<RutaService>;
  let mockAlertCtrl: jasmine.SpyObj<AlertController>;
  let mockToastCtrl: jasmine.SpyObj<ToastController>;

  const mockRuta = (id: number, activa = true): RutaAdminResponse => ({
    id, nombre: `Ruta ${id}`, precio: 50000, descripcion: 'Desc',
    dificultad: 'MEDIA', duracionMinutos: 60, activa,
  });

  const mockPage = (rutas: RutaAdminResponse[]): PageResponse<RutaAdminResponse> => ({
    content: rutas, totalElements: rutas.length, totalPages: 1, number: 0, size: 10,
  });

  const mockToastInstance = { present: jasmine.createSpy('present').and.resolveTo() };
  const mockAlertInstance = { present: jasmine.createSpy('present').and.resolveTo() };

  beforeEach(() => {
    mockRutaService = jasmine.createSpyObj('RutaService', [
      'listarAdmin', 'toggleActiva', 'eliminar',
    ]);
    mockAlertCtrl = jasmine.createSpyObj('AlertController', ['create']);
    mockToastCtrl = jasmine.createSpyObj('ToastController', ['create']);

    mockAlertCtrl.create.and.resolveTo(mockAlertInstance as any);
    mockToastCtrl.create.and.resolveTo(mockToastInstance as any);
    mockRutaService.listarAdmin.and.returnValue(of(mockPage([mockRuta(1), mockRuta(2)])));

    TestBed.configureTestingModule({
      imports: [RutasAdminListPage],
      providers: [
        { provide: RutaService, useValue: mockRutaService },
        { provide: AlertController, useValue: mockAlertCtrl },
        { provide: ToastController, useValue: mockToastCtrl },
        provideRouter([]),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  function getComponent(): RutasAdminListPage {
    const fixture = TestBed.createComponent(RutasAdminListPage);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  // ── Carga inicial ──────────────────────────────────────────────────────────

  it('llama listarAdmin en ngOnInit', () => {
    getComponent();
    expect(mockRutaService.listarAdmin).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ page: 0, size: 10 })
    );
  });

  it('popula rutas con el contenido de la página', fakeAsync(() => {
    const comp = getComponent();
    tick();
    expect(comp.rutas().length).toBe(2);
    expect(comp.rutas()[0].nombre).toBe('Ruta 1');
  }));

  it('muestra error cuando listarAdmin falla', fakeAsync(() => {
    mockRutaService.listarAdmin.and.returnValue(
      throwError(() => ({ error: { message: 'Error de red' } }))
    );
    const comp = getComponent();
    tick();
    expect(comp.error()).toBe('Error de red');
    expect(comp.rutas().length).toBe(0);
  }));

  it('loading es false tras carga exitosa', fakeAsync(() => {
    const comp = getComponent();
    tick();
    expect(comp.loading()).toBeFalse();
  }));

  // ── Toggle activa ──────────────────────────────────────────────────────────

  it('toggleActiva llama al servicio con el valor invertido', fakeAsync(() => {
    const ruta = mockRuta(1, true);
    mockRutaService.toggleActiva.and.returnValue(of({ ...ruta, activa: false }));

    const comp = getComponent();
    tick();
    comp.toggleActiva(ruta);
    tick();

    expect(mockRutaService.toggleActiva).toHaveBeenCalledWith(1, false);
  }));

  it('toggleActiva actualiza la ruta en la lista local', fakeAsync(() => {
    const ruta = mockRuta(1, true);
    mockRutaService.toggleActiva.and.returnValue(of({ ...ruta, activa: false }));

    const comp = getComponent();
    tick();
    comp.toggleActiva(ruta);
    tick();

    const actualizada = comp.rutas().find((r) => r.id === 1);
    expect(actualizada?.activa).toBeFalse();
  }));

  it('toggleActiva muestra error en signal si el servicio falla', fakeAsync(() => {
    const ruta = mockRuta(1, true);
    mockRutaService.toggleActiva.and.returnValue(
      throwError(() => ({ error: { message: 'Sin conexión' } }))
    );

    const comp = getComponent();
    tick();
    comp.toggleActiva(ruta);
    tick();

    expect(mockToastCtrl.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ color: 'danger' })
    );
  }));

  // ── Eliminar ───────────────────────────────────────────────────────────────

  it('confirmarEliminar abre AlertController', fakeAsync(async () => {
    const comp = getComponent();
    tick();
    await comp.confirmarEliminar(mockRuta(1));
    expect(mockAlertCtrl.create).toHaveBeenCalled();
    expect(mockAlertInstance.present).toHaveBeenCalled();
  }));

  // ── Paginación ─────────────────────────────────────────────────────────────

  it('irPagina actualiza pagina y vuelve a cargar', fakeAsync(() => {
    const comp = getComponent();
    tick();
    mockRutaService.listarAdmin.calls.reset();
    comp.irPagina(2);
    tick();
    expect(comp.pagina()).toBe(2);
    expect(mockRutaService.listarAdmin).toHaveBeenCalledWith(
      jasmine.objectContaining({ page: 2 })
    );
  }));

  // ── dificultadLabel ────────────────────────────────────────────────────────

  it('dificultadLabel traduce correctamente', () => {
    const comp = getComponent();
    expect(comp.dificultadLabel('FACIL')).toBe('Fácil');
    expect(comp.dificultadLabel('MEDIA')).toBe('Media');
    expect(comp.dificultadLabel('DIFICIL')).toBe('Difícil');
    expect(comp.dificultadLabel('DESCONOCIDO')).toBe('DESCONOCIDO');
  });
});