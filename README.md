# Horse Reserved — Frontend

Aplicación móvil y web para la gestión de reservas de caballos. Construida con Angular 18, Ionic 8 y Capacitor 7, orientada a Android e iOS con soporte web.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework web | Angular | 18 |
| UI components | Ionic Angular | 8 |
| Runtime móvil | Capacitor | 7 |
| Estilos | Tailwind CSS | 4 |
| Lenguaje | TypeScript | 5.5 |
| HTTP client | Angular HttpClient | — |
| Testing | Karma + Jasmine | — |

### Plugins de Capacitor

| Plugin | Uso |
|---|---|
| `@capacitor/app` | Ciclo de vida de la app |
| `@capacitor/haptics` | Feedback táctil |
| `@capacitor/keyboard` | Control del teclado nativo |
| `@capacitor/status-bar` | Barra de estado (modo dark) |

---

## Arquitectura

```
src/app/
├── core/
│   ├── guards/          # authGuard (funcional)
│   ├── interceptors/    # authInterceptor — inyecta Bearer token, maneja 401
│   ├── models/          # Interfaces y enums de auth
│   └── services/        # AuthService — estado con signals + localStorage
└── features/
    ├── auth/
    │   ├── login/
    │   ├── register/
    │   ├── change-password/
    │   ├── forgot-password/
    │   ├── reset-password/
    │   └── oauth2-redirect/
    └── home/
```

- **Standalone components** — sin NgModules (Angular 18 standalone API)
- **Lazy loading** en todas las rutas de features
- **Bootstrap** via `bootstrapApplication` en `main.ts` con `appConfig`
- **Modo Ionic**: Material Design (`md`)

---

## Autenticación

- JWT almacenado en `localStorage` (clave: `hr_session`) con campo `expiresAt`
- `authInterceptor` agrega el header `Authorization: Bearer <token>` a cada petición
- `authGuard` protege las rutas `/home` y `/auth/change-password`
- OAuth2 Google: redirige a `/oauth2/authorization/google`, callback en `/auth/oauth2-redirect?token=&email=&role=`
- Recuperación de contraseña: flujo de dos pasos vía email (token UUID con validez de 30 min)

---

## Rutas

| Path | Componente | Protegida |
|---|---|---|
| `/` | → `/auth/login` | |
| `/auth/login` | `LoginPage` | |
| `/auth/register` | `RegisterPage` | |
| `/auth/change-password` | `ChangePasswordPage` | Sí |
| `/auth/forgot-password` | `ForgotPasswordPage` | |
| `/auth/reset-password?token=` | `ResetPasswordPage` | |
| `/auth/oauth2-redirect` | `OAuth2RedirectPage` | |
| `/home` | `HomePage` | Sí |
| `**` | → `/auth/login` | |

---

## Conexión con el backend

- URL base: `http://localhost:8080`
- El servidor de desarrollo proxy redirige `/api/**` y `/oauth2/**` al backend

Endpoints consumidos:

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login con email y contraseña |
| POST | `/api/auth/register` | Registro de usuario |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| PUT | `/api/auth/change-password` | Cambio de contraseña |
| POST | `/api/auth/forgot-password` | Solicitar enlace de recuperación por email |
| POST | `/api/auth/reset-password` | Restablecer contraseña con token |

---

## Requisitos previos

- Node.js >= 18
- npm >= 9
- Angular CLI 18
- (Para móvil) Android Studio o Xcode

---

## Instalación

```bash
npm install
```

> Nota: el proyecto usa `--legacy-peer-deps` (configurado en `.npmrc`) por incompatibilidad de peers entre Tailwind CSS v4 y el build system de Angular 18.

---

## Comandos de desarrollo

```bash
# Servidor de desarrollo web (localhost:4200)
npm start

# Compilar para producción
npm run build

# Ejecutar tests unitarios
npm test

# Compilar, sincronizar y abrir en Android Studio
npm run cap:android

# Compilar, sincronizar y abrir en Xcode
npm run cap:ios
```

---

## Variables de entorno

Archivo: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  oauth2GoogleUrl: 'http://localhost:8080/oauth2/authorize/google',
};
```

---

## Identificación de la app (Capacitor)

| Campo | Valor |
|---|---|
| App ID | `com.horsereserved.app` |
| App Name | `Horse Reserved` |
| Web dir | `dist/horse-reserved-front/browser` |
| Android scheme | `https` |

---

## Proyecto relacionado

Backend: Spring Boot 4 + PostgreSQL + JWT + OAuth2 Google → [`horse_reserved`](https://github.com/azrrael22/horse_reserved.git)
