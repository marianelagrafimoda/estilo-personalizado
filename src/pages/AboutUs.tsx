
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-lilac/10 text-lilac-dark text-sm font-medium rounded-full mb-2">
              Quiénes Somos
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Nuestra Historia</h1>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="prose prose-lg">
              <p className="text-gray-600">
                En GrafiModa, nos apasiona transformar tus ideas en prendas únicas que reflejen tu personalidad. 
                Somos un equipo dedicado a la creación de productos personalizados de alta calidad, 
                combinando creatividad con las mejores tecnologías de impresión.
              </p>
              
              <p className="text-gray-600">
                Nuestra misión es hacer que cada prenda sea especial, trabajando estrechamente 
                con nuestros clientes para crear diseños que cuenten historias y expresen 
                individualidad.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-lilac-dark">5+</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Años de Experiencia</h3>
                <p className="text-gray-600">Creando productos personalizados de calidad</p>
              </div>
              
              <div className="text-center">
                <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-lilac-dark">1000+</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Clientes Satisfechos</h3>
                <p className="text-gray-600">Confiando en nuestro trabajo</p>
              </div>
              
              <div className="text-center">
                <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-lilac-dark">100%</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Personalización</h3>
                <p className="text-gray-600">Diseños únicos para cada cliente</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
