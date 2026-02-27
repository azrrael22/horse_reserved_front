import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  StoredSession,
  UserProfileResponse,
  UserRole,
} from '../models/auth.models';

const SESSION_KEY = 'hr_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  private readonly _session = signal<StoredSession | null>(
    this.loadSession()
  );

  readonly session = this._session.asReadonly();
  readonly isLoggedIn = computed(() => {
    const s = this._session();
    return !!s && s.expiresAt > Date.now();
  });
  readonly currentUser = computed(() => this._session());

  // ─── Auth calls ────────────────────────────────────────────────────────────

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, req)
      .pipe(tap((res) => this.saveSession(res)));
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, req)
      .pipe(tap((res) => this.saveSession(res)));
  }

  getMe(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/me`);
  }

  changePassword(req: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/change-password`, req, {
      responseType: 'text',
    });
  }

  // ─── OAuth2 ────────────────────────────────────────────────────────────────

  handleOAuth2Redirect(token: string, email: string, role: UserRole): void {
    // Build a minimal session from OAuth2 redirect params.
    // expiresIn from backend is 86400s (24h).
    const session: StoredSession = {
      token,
      userId: 0, // will be refreshed on first /me call
      email,
      primerNombre: '',
      primerApellido: '',
      role,
      expiresAt: Date.now() + 86400 * 1000,
    };
    this.persistSession(session);

    // Fetch full profile to populate name / userId
    this.getMe().subscribe({
      next: (profile) => {
        const updated: StoredSession = {
          ...session,
          userId: profile.userId,
          primerNombre: profile.primerNombre,
          primerApellido: profile.primerApellido,
        };
        this.persistSession(updated);
      },
      error: () => {
        // Non-critical — session still valid with partial data
      },
    });
  }

  // ─── Session helpers ───────────────────────────────────────────────────────

  getToken(): string | null {
    return this._session()?.token ?? null;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this._session.set(null);
    this.router.navigate(['/auth/login']);
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private saveSession(res: AuthResponse): void {
    const session: StoredSession = {
      token: res.token,
      userId: res.userId,
      email: res.email,
      primerNombre: res.primerNombre,
      primerApellido: res.primerApellido,
      role: res.role,
      expiresAt: Date.now() + res.expiresIn * 1000,
    };
    this.persistSession(session);
  }

  private persistSession(session: StoredSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this._session.set(session);
  }

  private loadSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: StoredSession = JSON.parse(raw);
      if (session.expiresAt <= Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }
}
