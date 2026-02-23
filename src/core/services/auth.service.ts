import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular/standalone';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  AuthResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
  UserRole,
} from '../models/auth.models';

const API_URL = 'http://localhost:8080/api/auth';
const TOKEN_KEY = 'cs_token';
const USER_KEY  = 'cs_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http    = inject(HttpClient);
  private readonly router  = inject(Router);
  private readonly toast   = inject(ToastController);
  private readonly loading = inject(LoadingController);

  // ── Estado reactivo con signals ────────────────────────────────────────────
  private readonly _currentUser = signal<CurrentUser | null>(this.loadUser());
  private readonly _token       = signal<string | null>(this.loadToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly token       = this._token.asReadonly();
  readonly isLoggedIn  = computed(() => !!this._token() && !!this._currentUser());
  readonly userRole    = computed(() => this._currentUser()?.role ?? null);

  // ── Persistencia ───────────────────────────────────────────────────────────
  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): CurrentUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as CurrentUser) : null;
    } catch {
      return null;
    }
  }

  private persist(res: AuthResponse): void {
    const user: CurrentUser = {
      userId:        res.userId,
      email:         res.email,
      primerNombre:  res.primerNombre,
      primerApellido: res.primerApellido,
      role:          res.role,
    };
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(res.token);
    this._currentUser.set(user);
  }

  private redirect(role: UserRole): void {
    const map: Record<UserRole, string> = {
      cliente:        '/cliente/dashboard',
      operador:       '/operador/dashboard',
      administrador:  '/admin/dashboard',
    };
    this.router.navigateByUrl(map[role]);
  }

  // ── API ────────────────────────────────────────────────────────────────────
  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/login`, req).pipe(
      tap(res => {
        this.persist(res);
        this.redirect(res.role);
      }),
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/register`, req).pipe(
      tap(res => {
        this.persist(res);
        this.redirect(res.role);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigateByUrl('/auth/login');
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorize/google';
  }

  handleOAuth2Token(
    token: string,
    role: UserRole,
    userId: number,
    email: string,
    primerNombre: string,
    primerApellido: string,
  ): void {
    const fakeRes: AuthResponse = {
      token, type: 'Bearer', expiresIn: 86400,
      userId, email, primerNombre, primerApellido, role,
    };
    this.persist(fakeRes);
    this.redirect(role);
  }

  hasRole(...roles: UserRole[]): boolean {
    const r = this._currentUser()?.role;
    return r ? roles.includes(r) : false;
  }

  // ── Helpers de UI con Ionic ────────────────────────────────────────────────
  async showErrorToast(message: string): Promise<void> {
    const t = await this.toast.create({
      message,
      duration: 3500,
      color: 'danger',
      position: 'top',
      icon: 'alert-circle-outline',
      buttons: [{ icon: 'close-outline', role: 'cancel' }],
    });
    await t.present();
  }

  async createLoader(message = 'Cargando...'): Promise<HTMLIonLoadingElement> {
    const l = await this.loading.create({ message, spinner: 'crescent' });
    await l.present();
    return l;
  }
}
