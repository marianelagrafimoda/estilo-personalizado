
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteInfo } from '../contexts/SiteContext';

const Footer: React.FC = () => {
  const { siteInfo } = useSiteInfo();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-lilac/10 py-10 mt-10">
      <div className="container-custom mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="GrafiModa" className="h-10" />
              <span className="font-serif text-xl font-medium">GrafiModa</span>
            </Link>
            <p className="text-gray-600">{siteInfo.slogan}</p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-medium text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-lilac-dark transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/#productos" className="text-gray-600 hover:text-lilac-dark transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/#personalizacion" className="text-gray-600 hover:text-lilac-dark transition-colors">
                  Personalización
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-lilac-dark transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-serif font-medium text-lg mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg 
                  className="w-5 h-5 mr-2 text-lilac-dark" 
                  fill="currentColor" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24"
                >
                  <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
                </svg>
                <a 
                  href={`https://wa.me/${siteInfo.whatsappNumber.replace(/\+/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-lilac-dark transition-colors"
                >
                  {siteInfo.whatsappNumber}
                </a>
              </li>
              <li className="flex items-center">
                <svg 
                  className="w-5 h-5 mr-2 text-lilac-dark" 
                  fill="currentColor" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z" />
                </svg>
                <a 
                  href="mailto:marianela.grafimoda@gmail.com" 
                  className="text-gray-600 hover:text-lilac-dark transition-colors"
                >
                  marianela.grafimoda@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-lilac/20 mt-8 pt-6 text-center text-gray-600 text-sm">
          <p>&copy; {currentYear} GrafiModa. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
