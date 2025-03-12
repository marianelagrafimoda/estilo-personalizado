
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const availableSizes = product.sizes.filter(size => size.available);
  
  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product, selectedSize);
      // Reset selected size after adding to cart
      setSelectedSize(null);
    }
  };

  return (
    <div 
      className="group glass-card rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden h-64">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-700 transform group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-70' : 'opacity-0'}`}></div>
      </div>
      
      <div className="p-4">
        <h3 className="font-serif text-xl font-medium mb-2">{product.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-lg">${product.price.toFixed(2)}</span>
        </div>
        
        {availableSizes.length > 0 ? (
          <>
            <div className="mb-3">
              <p className="text-sm font-medium mb-1">Tallas disponibles:</p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                      selectedSize === size.id
                        ? 'bg-lilac text-white border-lilac'
                        : 'bg-white text-gray-800 border-gray-300 hover:border-lilac'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                selectedSize
                  ? 'bg-lilac hover:bg-lilac-dark text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Agregar al carrito</span>
            </button>
          </>
        ) : (
          <p className="text-red-500 text-sm mt-2">Agotado</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
