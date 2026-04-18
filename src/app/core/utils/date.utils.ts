const BOGOTA_TZ = 'America/Bogota';

export function todayInColombia(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: BOGOTA_TZ }).format(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Mediodía UTC evita ambigüedades de medianoche al formatear en otra zona horaria
  const result = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return new Intl.DateTimeFormat('en-CA', { timeZone: BOGOTA_TZ }).format(result);
}
