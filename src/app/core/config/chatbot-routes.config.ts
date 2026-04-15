// Mapa de rutas internas reconocidas por el chatbot.
// Para añadir una nueva ruta navegable desde el asistente, agrégala aquí
// sin necesidad de modificar el componente chatbot.
export const KNOWN_CHATBOT_ROUTES: ReadonlyMap<string, string> = new Map([
  ['/tabs/inicio', '/tabs/inicio'],
  ['/tabs/reservas', '/tabs/reservas'],
  ['/tabs/reservas/nueva', '/tabs/reservas/nueva'],
  ['/tabs/cuenta', '/tabs/cuenta'],
  ['/auth/login', '/auth/login'],
  ['/auth/register', '/auth/register'],
  ['/auth/forgot-password', '/auth/forgot-password'],
]);
