
import React, { useState, useEffect, useRef } from 'react';
import { useSiteInfo } from '../contexts/SiteContext';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const ProductCarousel: React.FC = () => {
  const { siteInfo, isLoading } = useSiteInfo();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const totalSlides = siteInfo?.carousel_images?.length || 0;

  const nextSlide = () => {
    if (isAnimating || totalSlides === 0) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isAnimating || totalSlides === 0) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  useEffect(() => {
    // Auto slide
    if (totalSlides > 0) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 6000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [totalSlides]);

  const resetInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 6000);
    }
  };

  const handleSlideNav = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    
    setIsAnimating(true);
    setCurrentSlide(index);
    resetInterval();
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Se estiver carregando, mostrar um placeholder
  if (isLoading) {
    return (
      <div className="relative h-[70vh] md:h-[80vh] flex items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-lilac" />
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Image Slides */}
      <div className="absolute inset-0">
        {siteInfo.carousel_images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-white font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            GrafiModa
          </h1>
          <p className="text-white text-xl md:text-2xl mb-8 animate-slide-up">
            {siteInfo.slogan}
          </p>
          <a
            href="#personalizacion"
            className="inline-block px-6 py-3 bg-lilac hover:bg-lilac-dark text-white rounded-md font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg animate-slide-up"
          >
            Quiero personalizar mi estilo
          </a>
        </div>
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={() => {
              prevSlide();
              resetInterval();
            }}
            className="absolute top-1/2 left-4 z-30 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={() => {
              nextSlide();
              resetInterval();
            }}
            className="absolute top-1/2 right-4 z-30 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-2">
            {siteInfo.carousel_images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideNav(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductCarousel;
