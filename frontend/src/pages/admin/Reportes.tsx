import { reporteService } from '@/services/reporte.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Package, TrendingUp, ShoppingCart, Users, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const reportesOperacionales = [
  { title: 'Órdenes', desc: 'Listado de órdenes con detalle', icon: ShoppingCart, action: () => reporteService.reporteOrdenes() },
  { title: 'Inventario Valorizado', desc: 'Stock actual con valorización', icon: Package, action: () => reporteService.reporteInventario() },
  { title: 'Movimientos', desc: 'Entradas y salidas de inventario', icon: Archive, action: () => reporteService.reporteMovimientos() },
  { title: 'Stock Bajo', desc: 'Productos con stock crítico', icon: AlertTriangle, action: () => reporteService.reporteStockBajo() },
  { title: 'Pagos', desc: 'Pagos recibidos en el período', icon: TrendingUp, action: () => reporteService.reportePagos() },
  { title: 'Devoluciones', desc: 'Órdenes devueltas', icon: FileText, action: () => reporteService.reporteDevoluciones() },
];

const reportesGestion = [
  { title: 'Rentabilidad por Producto', desc: 'Margen bruto por producto', icon: TrendingUp, action: () => reporteService.reporteRentabilidad() },
  { title: 'Ventas por Categoría', desc: 'Comparativa de ventas', icon: ShoppingCart, action: () => reporteService.reporteVentasCategoria() },
  { title: 'Análisis de Clientes', desc: 'Segmentación y comportamiento', icon: Users, action: () => reporteService.reporteClientes() },
  { title: 'Rotación de Inventario', desc: 'Índice de rotación', icon: Archive, action: () => reporteService.reporteRotacion() },
];

export default function Reportes() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Reportes</h1>

      {/* Reportes Operacionales */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText size={20} /> Reportes Operacionales
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {reportesOperacionales.map((reporte, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <reporte.icon size={32} className="text-primary-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold">{reporte.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{reporte.desc}</p>
                  <Button variant="outline" size="sm" onClick={reporte.action}>
                    <Download size={14} className="mr-1" /> Descargar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reportes de Gestión */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <TrendingUp size={20} /> Reportes de Gestión
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportesGestion.map((reporte, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <reporte.icon size={32} className="text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold">{reporte.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{reporte.desc}</p>
                  <Button variant="outline" size="sm" onClick={reporte.action}>
                    <Download size={14} className="mr-1" /> Descargar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Fix missing import
import { AlertTriangle } from 'lucide-react';