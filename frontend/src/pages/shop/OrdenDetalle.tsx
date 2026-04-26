import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordenService } from '@/services/orden.service';
import { reporteService } from '@/services/reporte.service';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { ESTADOS_ORDEN } from '@/types';
import { ArrowLeft, Download, Truck, Package, CreditCard } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';

export default function OrdenDetalle() {
  const { id } = useParams<{ id: string }>();

  const { data: orden, isLoading } = useQuery({
    queryKey: ['orden', id],
    queryFn: () => ordenService.obtener(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!orden) return <div className="text-center py-12">Orden no encontrada</div>;

  const timeline = orden.ord_historial_estados || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/mis-ordenes" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6">
        <ArrowLeft size={18} />
        Volver a mis órdenes
      </Link>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Orden #{orden.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-gray-500">{formatDate(orden.fecha_pedido)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(orden.estado)}`}>
            {ESTADOS_ORDEN[orden.estado] || orden.estado}
          </span>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Historial de Estados</h3>
          <div className="space-y-4">
            {timeline.map((historial, index) => (
              <div key={historial.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {ESTADOS_ORDEN[historial.estado_nuevo] || historial.estado_nuevo}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(historial.fecha_cambio)}</p>
                  {historial.comentario && (
                    <p className="text-sm text-gray-600">{historial.comentario}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Productos</h3>
          <div className="space-y-3">
            {orden.ord_items_orden.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">{item.nombre_producto}</p>
                  <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                </div>
                <p className="font-semibold">{formatCurrency(Number(item.subtotal))}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(Number(orden.subtotal))}</span>
          </div>
          {Number(orden.descuento) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento</span>
              <span>-{formatCurrency(Number(orden.descuento))}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>IGV</span>
            <span>{formatCurrency(Number(orden.impuesto))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Envío</span>
            <span>{formatCurrency(Number(orden.costo_envio))}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(Number(orden.total))}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-4">
        <Button onClick={() => reporteService.facturaOrden(orden.id)} variant="outline">
          <Download size={18} className="mr-2" />
          Descargar Factura
        </Button>
        {['pendiente_pago', 'pagada'].includes(orden.estado) && (
          <Button
            onClick={() => ordenService.cancelar(orden.id)}
            variant="destructive"
          >
            Cancelar Orden
          </Button>
        )}
      </div>
    </div>
  );
}