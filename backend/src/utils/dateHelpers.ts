export function formatearFecha(fecha: Date): string {
  return fecha.toISOString().split('T')[0];
}

export function formatearFechaHora(fecha: Date): string {
  return fecha.toISOString().replace('T', ' ').split('.')[0];
}

export function calcularFechaExpiracion(minutos: number): Date {
  return new Date(Date.now() + minutos * 60 * 1000);
}

export function esFechaExpirada(fecha: Date): boolean {
  return new Date() > fecha;
}

export function obtenerRangoFechas(dias: number): { inicio: Date; fin: Date } {
  const fin = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - dias);
  return { inicio, fin };
}

export function obtenerInicioMes(): Date {
  const fecha = new Date();
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

export function obtenerFinMes(): Date {
  const fecha = new Date();
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
}