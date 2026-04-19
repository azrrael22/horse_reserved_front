import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthResponse, TipoDocumento } from '../models/auth.models';
import { AuthService } from './auth.service';

const SESSION_KEY = 'hr_session';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  function configureTestingModule(): void {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
  }

  function buildAuthResponse(): AuthResponse {
    return {
      token: 'jwt-token',
      type: 'Bearer',
      expiresIn: 3600,
      userId: 7,
      email: 'cliente@horse.com',
      primerNombre: 'Ana',
      primerApellido: 'Ruiz',
      role: 'CLIENTE',
    };
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    configureTestingModule();

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('guarda la sesion al iniciar sesion', () => {
    const payload = {
      email: 'cliente@horse.com',
      password: 'Password123',
      recaptchaToken: 'captcha-ok',
    };

    service.login(payload).subscribe((response) => {
      expect(response.email).toBe('cliente@horse.com');
    });

    const request = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(buildAuthResponse());

    const session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}');
    expect(session.token).toBe('jwt-token');
    expect(session.email).toBe('cliente@horse.com');
    expect(session.role).toBe('CLIENTE');
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getToken()).toBe('jwt-token');
  });

  it('elimina la sesion y redirige al hacer logout', () => {
    const session = {
      token: 'jwt-token',
      userId: 7,
      email: 'cliente@horse.com',
      primerNombre: 'Ana',
      primerApellido: 'Ruiz',
      role: 'CLIENTE',
      expiresAt: Date.now() + 60_000,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    service = TestBed.inject(AuthService);

    service.logout();

    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(service.session()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('descarta una sesion vencida al cargar el servicio', () => {
    localStorage.clear();
    TestBed.resetTestingModule();

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: 'expired-token',
        userId: 9,
        email: 'caducado@horse.com',
        primerNombre: 'Luis',
        primerApellido: 'Perez',
        role: 'CLIENTE',
        expiresAt: Date.now() - 1_000,
      })
    );

    configureTestingModule();
    const expiredAwareService = TestBed.inject(AuthService);
    const expiredAwareHttpMock = TestBed.inject(HttpTestingController);

    expect(expiredAwareService.session()).toBeNull();
    expect(expiredAwareService.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();

    expiredAwareHttpMock.verify();
  });

  it('consulta el perfil autenticado', () => {
    service.getMe().subscribe((profile) => {
      expect(profile.email).toBe('cliente@horse.com');
      expect(profile.tipoDocumento).toBe(TipoDocumento.CEDULA);
    });

    const request = httpMock.expectOne('http://localhost:8080/api/auth/me');
    expect(request.request.method).toBe('GET');

    request.flush({
      userId: 7,
      email: 'cliente@horse.com',
      primerNombre: 'Ana',
      primerApellido: 'Ruiz',
      tipoDocumento: TipoDocumento.CEDULA,
      documento: '1234567890',
      telefono: '3001234567',
      role: 'CLIENTE',
      isActive: true,
      habeasDataConsented: true,
    });
  });
});
