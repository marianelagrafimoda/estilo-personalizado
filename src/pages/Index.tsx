
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductCarousel from '../components/ProductCarousel';
import WhatsAppButton from '../components/WhatsAppButton';
import { useProducts } from '../contexts/ProductContext';

const Index: React.FC = () => {
  const { products } = useProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Carousel */}
      <ProductCarousel />
      
      {/* Featured Products Section */}
      <section id="productos" className="py-16">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-lilac/10 text-lilac-dark text-sm font-medium rounded-full mb-2">
              Nuestros Productos
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Ropa Personalizada</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra selección de prendas de alta calidad listas para ser personalizadas con tu estilo único.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Personalization CTA */}
      <section id="personalizacion" className="py-16 bg-gradient-to-r from-lilac/10 to-lilac/30">
        <div className="container-custom mx-auto">
          <div className="glass-card rounded-xl overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-lilac/20 text-lilac-dark text-sm font-medium rounded-full mb-4">
                  Personalización
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                  ¿Quieres un estilo realmente único?
                </h2>
                <p className="text-gray-600 mb-6">
                  Contáctanos directamente para crear prendas totalmente personalizadas según tus deseos y necesidades específicas. Nuestro equipo está listo para hacer realidad tu visión.
                </p>
                <div className="mt-2">
                  <WhatsAppButton />
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="/placeholder1.jpg"
                  alt="Personalización"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-lilac/10 text-lilac-dark text-sm font-medium rounded-full mb-2">
              Por qué elegirnos
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">La mejor calidad garantizada</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-lilac-dark" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19.48 13.24a4 4 0 1 0-5.27-6 4 4 0 1 0-6.67 4.33A5 5 0 0 0 12 23a5 5 0 0 0 7.48-9.76Zm-1.31-.82a3 3 0 0 1 .69 4.2A3 3 0 0 1 14 17.5a2.71 2.71 0 0 1-.33 0l4.5-5.08Zm-2.74-2.7a2 2 0 0 1 1.27.53l-4.5 5.08a3 3 0 0 1-.88-2.74 3 3 0 0 1 4.11-2.87ZM15.8 12a2 2 0 0 1-3.16-2.33A4 4 0 0 0 16 13.53l-.2-1.53ZM12 21a3 3 0 0 1-2.6-1.5 3 3 0 0 1 .72-3.8 4.83 4.83 0 0 0 1.88.3 5 5 0 0 0 3.89-1.88 5 5 0 0 0-1.95 4.87A3 3 0 0 1 12 21Zm-3.63-9.3a2 2 0 0 1 2.68-.94 4 4 0 0 0-1.05 3.94 5 5 0 0 0-2.57-2.06A1.82 1.82 0 0 1 8.37 11.7Z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">Materiales Premium</h3>
              <p className="text-gray-600">
                Utilizamos solo los mejores materiales para asegurar la calidad y durabilidad de nuestros productos.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-lilac-dark" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M21.555 13.168l-6.993 4.559c-.387-1.897-1.63-3.414-3.173-4.412l2.611-1.733 7.555-4.92c.05.379.087.76.087 1.154 0 1.92-.635 3.687-1.706 5.119l1.619.233zm-1.555-9.168c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 1.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zm-10 1.5c-.689 0-1.345.141-1.955.377.986.219 1.858.708 2.535 1.356.962-.405 2.029-.639 3.16-.639 2.895 0 5.476 1.423 7.08 3.617 1.7-.359 2.257-.988 2.345-1.176-.403-2.444-2.523-4.307-5.08-4.531-1.241-1.159-2.901-1.872-4.732-1.872-1.177 0-2.291.275-3.29.753-1.166-.934-2.647-1.485-4.248-1.485-3.743 0-6.785 3.042-6.785 6.786 0 .692.144 1.353.264 1.996.736.286 1.648.617 2.574.617.344 0 .67-.059.979-.145-1.44-3.006-1.402-6.546 0-6.546.819 0 1.329 1.826 1.441 3.153.383-.255.794-.458 1.228-.62-.01-.111-.015-.224-.015-.337 0-2.067 1.676-3.747 3.743-3.747 1.189 0 2.248.565 2.936 1.436.871-.376 1.752-.62 2.662-.708-.662-.847-1.688-1.396-2.842-1.396zm-8 8c0 2.485 2.018 4.5 4.5 4.5 2.484 0 4.5-2.015 4.5-4.5s-2.016-4.5-4.5-4.5c-2.482 0-4.5 2.015-4.5 4.5zm2-.5h5v1h-5v-1z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">Diseño Personalizado</h3>
              <p className="text-gray-600">
                Creamos diseños únicos adaptados a tus preferencias y estilo personal.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-lilac-dark" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M24 11.374c0 4.55-3.783 6.96-7.146 6.796-.151 1.448.061 2.642.384 3.641l-3.72-.003c1.433-1.462 1.704-4.229 1.296-6.296-2.064 2.077-4.697 2.586-7.82 2.586-4.084 0-6.994-2.03-6.994-6.738 0-4.665 3.296-7.36 6.994-7.36 4.015 0 6.774 2.304 6.98 6.005.661-1.669 1.815-2.972 2.548-3.003.783 0 1.939 1.746 2.022 3.003.151 1.787.265 1.368 1.274 1.368h1.482c.203 0 .451.044.524.662.082.262.254 2.333.254 2.333s-.066-.023-.947-.028c-.725-.005-1.707.167-1.888.9-.169.733.096 1.485 1.831 1.463 1.045-.016 1.619-.159 1.733-.233.144-.098.287-.19.429-.29.107-.176.206-.356.282-.539.186-.53.196-.854.194-1.263.012-1.866.015-3.681 0-5.546.061-.468-.092-1.036-.35-1.478-.429-.726-1.323-1.071-2.232-1.051-2.1.046-4.209.126-6.308.134-2.018.008-4.238-.037-6.247-.135-2.293-.112-4.495 1.901-4.495 5.299 0 2.904 2.032 4.904 4.633 4.904 1.664 0 2.736-.672 3.178-1.543-.306-.446-.571-1.199-.736-1.609-.181.168-.42.315-.685.431-.298.135-.632.196-.975.196-1.36 0-2.231-1.311-2.231-3 0-2.721 1.352-4.428 2.437-4.428.648 0 1.164.373 1.476.912.229-.49.437-1.3.581-1.546-.299-.398-1.058-.807-1.979-.807-3.233 0-5.376 2.605-5.376 6 0 3.322 2.106 5.38 5.016 5.38 1.703 0 3.088-.562 4.574-1.607.424.686.936 1.401 1.312 1.937-.234.273-.514.509-.814.717 0 0 1.006 1.371 1.042 1.422.207-.195.42-.39.65-.586.334-.29.717-.564 1.131-.795.334-.186.711-.319 1.08-.435-.187-.248-.387-.503-.576-.753l.32-.198c1.763-1.078 3.396-2.329 4.322-4.302.353-.75.705-1.261.553-2.764.349.617.721 1.235.721 2.815zm-2.817 4.171c-.046.333-.43.671-1.138.683-.303.006-.399-.115-.399-.307 0-.453.541-.565.865-.565.315 0 .639.071.672.189z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">Atención Personalizada</h3>
              <p className="text-gray-600">
                Te guiamos durante todo el proceso para asegurar que obtengas exactamente lo que deseas.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-lilac/5">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-lilac/10 text-lilac-dark text-sm font-medium rounded-full mb-2">
              Preguntas Frecuentes
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Todo lo que necesitas saber</h2>
          </div>
          
          <div className="max-w-3xl mx-auto divide-y divide-lilac/20">
            <div className="py-5">
              <h3 className="font-medium text-lg flex items-center">
                <span className="text-lilac-dark mr-2">
                  <ArrowRight className="h-5 w-5" />
                </span>
                ¿Cuánto tiempo tarda en llegar mi pedido personalizado?
              </h3>
              <p className="mt-2 text-gray-600 pl-7">
                El tiempo de entrega varía según la complejidad del diseño y la cantidad de prendas. Generalmente, los pedidos personalizados tardan entre 7 y 14 días hábiles.
              </p>
            </div>
            
            <div className="py-5">
              <h3 className="font-medium text-lg flex items-center">
                <span className="text-lilac-dark mr-2">
                  <ArrowRight className="h-5 w-5" />
                </span>
                ¿Puedo enviar mi propio diseño para personalizarlo?
              </h3>
              <p className="mt-2 text-gray-600 pl-7">
                ¡Absolutamente! Puedes enviarnos tu diseño por WhatsApp y trabajaremos juntos para aplicarlo a la prenda que elijas.
              </p>
            </div>
            
            <div className="py-5">
              <h3 className="font-medium text-lg flex items-center">
                <span className="text-lilac-dark mr-2">
                  <ArrowRight className="h-5 w-5" />
                </span>
                ¿Ofrecen descuentos para pedidos al por mayor?
              </h3>
              <p className="mt-2 text-gray-600 pl-7">
                Sí, ofrecemos precios especiales para pedidos de 10 o más prendas. Contáctanos directamente para obtener una cotización personalizada.
              </p>
            </div>
            
            <div className="py-5">
              <h3 className="font-medium text-lg flex items-center">
                <span className="text-lilac-dark mr-2">
                  <ArrowRight className="h-5 w-5" />
                </span>
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="mt-2 text-gray-600 pl-7">
                Aceptamos transferencias bancarias, depósitos y efectivo contra entrega. Los detalles de pago se proporcionarán al finalizar tu pedido.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom mx-auto">
          <div className="bg-gradient-to-r from-lilac to-lilac-dark rounded-xl p-8 md:p-12 text-center text-white">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para personalizar tu estilo?
            </h2>
            <p className="max-w-2xl mx-auto mb-8">
              Contáctanos ahora y comienza a crear prendas únicas que reflejen tu personalidad y estilo.
            </p>
            <WhatsAppButton className="bg-white text-lilac-dark hover:bg-gray-100" />
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
