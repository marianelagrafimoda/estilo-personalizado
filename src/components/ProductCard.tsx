
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const availableSizes = product.sizes.filter(size => size.available);
  
  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product, selectedSize);
      toast({
        title: "¡Producto agregado!",
        description: `${product.title} en talla ${selectedSize} se agregó al carrito.`,
        duration: 3000,
      });
      // Reset selected size after adding to cart
      setSelectedSize(null);
    }
  };

  // Calcular el color de texto basado en el color de fondo para asegurar contraste
  const getTextColor = (bgColor: string) => {
    // Convertir el color a RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcular luminosidad
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Si es oscuro, usar texto claro
    return luminance > 0.5 ? '#333333' : '#FFFFFF';
  };
  
  const textColor = getTextColor(product.cardColor);

  return (
    <div 
      className="group overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg rounded-lg"
      style={{ 
        backgroundColor: product.cardColor,
        color: textColor,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
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
        <p className="text-sm mb-3 line-clamp-2" style={{ opacity: 0.9 }}>{product.description}</p>
        
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
                        : 'bg-white/80 text-gray-800 border-gray-300 hover:border-lilac'
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
                  ? 'bg-lilac hover:bg-lilac-dark text-black font-medium'
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
