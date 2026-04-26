import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productoService } from '@/services/producto.service';
import ProductCard from '@/components/producto/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ShoppingBag, Truck, Shield, CreditCard } from 'lucide-react';

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['productos-destacados'],
    queryFn: () => productoService.listar({ limit: '12', ordenar_por: 'fecha' }),
  });

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Bienvenido a Mi Tienda</h1>
          <p className="text-xl mb-8">Descubre los mejores productos al mejor precio</p>
          <Link
            to="/catalogo"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Ver Catálogo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Envío Rápido', desc: 'Entregas en 24-48 horas' },
              { icon: Shield, title: 'Compra Segura', desc: 'Protegemos tus datos' },
              { icon: CreditCard, title: 'Pago Fácil', desc: 'Múltiples métodos de pago' },
              { icon: ShoppingBag, title: 'Mejores Precios', desc: 'Ofertas exclusivas' },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <feature.icon className="w-10 h-10 mx-auto text-primary-600 mb-3" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Productos Destacados</h2>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.data?.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/catalogo"
              className="inline-block border-2 border-primary-600 text-primary-600 px-6 py-2 rounded-lg hover:bg-primary-600 hover:text-white transition"
            >
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}