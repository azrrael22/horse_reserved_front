export type RangoMetrica = 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';

export interface PuntoMetricaDto {
  periodo: string;
  label: string;
  ganancias: number;
  cantidadTransacciones: number;
}

export interface MetricasGananciasResponse {
  rango: RangoMetrica;
  fechaInicio: string;
  fechaFin: string;
  totalGanancias: number;
  totalTransacciones: number;
  promedioGananciasPorTransaccion: number;
  datos: PuntoMetricaDto[];
}

export interface MetricasPagosResponse {
  desde: string;
  hasta: string;
  ingresosBrutos: number;
  totalReembolsos: number;
  ingresosNetos: number;
  ticketPromedio: number;
  cantidadPagosRealizados: number;
}
