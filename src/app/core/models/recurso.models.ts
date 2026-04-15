export interface CaballoResponse {
  id: number;
  nombre: string;
  raza: string;
  activo: boolean;
}

export interface CaballoRequest {
  nombre: string;
  raza: string;
  activo: boolean;
}

export interface GuiaResponse {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  activo: boolean;
}

export interface GuiaRequest {
  nombre: string;
  telefono: string;
  email: string;
  activo: boolean;
}
