import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Mi Tienda</h3>
            <p className="text-gray-400 text-sm">
              Tu tienda de confianza para compras en línea.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/catalogo" className="hover:text-white">Catálogo</Link></li>
              <li><Link to="/" className="hover:text-white">Ofertas</Link></li>
              <li><Link to="/" className="hover:text-white">Novedades</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@mitienda.com</li>
              <li>Teléfono: +51 1 234-5678</li>
              <li>Lima, Perú</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Mi Tienda. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}