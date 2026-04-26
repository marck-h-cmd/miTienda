import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioService } from '@/services/inventario.service';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventarioAdmin() {
  const [page, setPage] = useState(1);
  const [ajusteProducto, setAjusteProducto] = useState('');
  const [ajusteCantidad, setAjusteCantidad] = useState(0);
  const [ajusteMotivo, setAjusteMotivo] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventario', page],
    queryFn: () => inventarioService.obtenerStock({ page: String(page), limit: '10' }),
  });

  const { data: stockBajo } = useQuery({
    queryKey: ['stock-bajo'],
    queryFn: () => inventarioService.productosStockBajo(),
  });

  const ajusteMutation = useMutation({
    mutationFn: (data: any) => inventarioService.ajustarStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventario'] });
      toast.success('Stock ajustado exitosamente');
      setAjusteProducto('');
      setAjusteCantidad(0);
      setAjusteMotivo('');
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inventario</h1>

      {/* Alertas de stock bajo */}
      {stockBajo && stockBajo.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
            <AlertTriangle size={18} />
            Productos con Stock Bajo
          </div>
          <div className="flex flex-wrap gap-2">
            {stockBajo.slice(0, 5).map((item: any) => (
              <span key={item.producto_id} className="bg-yellow-100 px-3 py-1 rounded-full text-sm">
                {item.cat_productos?.nombre}: {item.cantidad_fisica}
              </span>
            ))}
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle>Ajuste Rápido de Stock</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Producto ID</Label>
              <Input value={ajusteProducto} onChange={(e) => setAjusteProducto(e.target.value)} placeholder="UUID del producto" />
            </div>
            <div>
              <Label>Cantidad (+/-)</Label>
              <Input type="number" value={ajusteCantidad} onChange={(e) => setAjusteCantidad(Number(e.target.value))} />
            </div>
            <div className="flex-1">
              <Label>Motivo</Label>
              <Input value={ajusteMotivo} onChange={(e) => setAjusteMotivo(e.target.value)} placeholder="Motivo del ajuste" />
            </div>
            <Button
              onClick={() => ajusteMutation.mutate({
                producto_id: ajusteProducto,
                cantidad: Math.abs(ajusteCantidad),
                tipo: ajusteCantidad >= 0 ? 'positivo' : 'negativo',
                motivo: ajusteMotivo,
              })}
            >
              Ajustar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de stock */}
      <Card>
        <CardHeader><CardTitle>Stock Actual</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Producto</th>
                  <th className="text-center p-3">Stock Físico</th>
                  <th className="text-center p-3">Reservado</th>
                  <th className="text-center p-3">Disponible</th>
                  <th className="text-right p-3">Precio Venta</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((item) => (
                  <tr key={item.producto_id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {item.cat_productos?.sku} - {item.cat_productos?.nombre}
                    </td>
                    <td className="p-3 text-center">{item.cantidad_fisica}</td>
                    <td className="p-3 text-center text-orange-500">{item.cantidad_reservada}</td>
                    <td className="p-3 text-center font-bold">
                      {item.cantidad_fisica - item.cantidad_reservada}
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.cat_productos?.precio_venta || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.total > 10 && (
            <Pagination
              currentPage={data.page}
              totalPages={Math.ceil(data.total / data.limit)}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}