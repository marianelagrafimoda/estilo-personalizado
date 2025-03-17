
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import ProductDetailModal from './ProductDetailModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get available sizes
  const availableSizes = product.sizes?.filter(s => s.available) || [];
  const adultSizes = availableSizes.filter(s => !s.isChildSize);
  const kidSizes = availableSizes.filter(s => s.isChildSize);

  // Handle quick add to cart
  const handleAddToCart = () => {
    // If no size or color selected, open modal instead
    if (!selectedSize || !selectedColor) {
      setIsDetailModalOpen(true);
      return;
    }

    addToCart(product, selectedSize, selectedColor);
    setIsMenuOpen(false);
    setSelectedSize('');
    setSelectedColor('');
  };

  // Get product images with fallback to the main image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : ['/placeholder.svg']);

  // Handle image navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    setCurrentImageIndex((prevIndex) => 
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
      <div 
        className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
        style={{ backgroundColor: product.cardColor + '10' }}
      >
        <div 
          className="relative h-52 md:h-60 overflow-hidden cursor-pointer"
          onClick={() => setIsDetailModalOpen(true)}
        >
          {productImages.length > 0 ? (
            <img
              src={productImages[currentImageIndex]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
          )}

          {/* Product images navigation */}
          {productImages.length > 1 && (
            <>
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* Image indicator dots */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                {productImages.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentImageIndex ? 'bg-lilac' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quick view button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="flex items-center px-3 py-1.5 rounded-md bg-white/90 text-lilac-dark text-sm hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailModalOpen(true);
              }}
            >
              <Search className="w-4 h-4 mr-1" />
              Ver detalles
            </button>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-medium text-lg mb-1 text-lilac-dark">{product.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
          <p className="font-bold text-lg mb-2">${product.price.toFixed(2)}</p>
          
          <Button 
            onClick={(e) => {
              e.preventDefault();
              setIsDetailModalOpen(true);
            }}
            className="w-full bg-lilac hover:bg-lilac-dark flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar
          </Button>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={product}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </>
  );
};

export default ProductCard;
