
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const availableSizes = product.sizes.filter(size => size.available);
  
  // Separando tamanhos para adultos e crianças
  const adultSizes = availableSizes.filter(size => !size.isChildSize);
  const childSizes = availableSizes.filter(size => size.isChildSize === true);
  
  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      // Check if we have stock
      if (product.stockQuantity <= 0) {
        toast({
          title: "Sin stock",
          description: "Este producto está agotado actualmente.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      addToCart(product, selectedSize, selectedColor);
      toast({
        title: "¡Producto agregado!",
        description: `${product.title} en talla ${selectedSize} y color ${selectedColor} se agregó al carrito.`,
        duration: 3000,
      });
      // Reset selected options after adding to cart
      setSelectedSize(null);
      setSelectedColor(null);
    } else {
      toast({
        title: "Selección incompleta",
        description: "Por favor, selecciona talla y color",
        variant: "destructive",
        duration: 3000,
      });
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
  
  const cardColor = product.cardColor || '#C8B6E2';
  const textColor = getTextColor(cardColor);

  return (
    <div 
      className="group overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg rounded-lg"
      style={{ 
        backgroundColor: cardColor,
        color: textColor,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden h-64">
        <img 
          src={product.imageUrl || '/placeholder.svg'} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-700 transform group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-70' : 'opacity-0'}`}></div>
        
        {/* Price tag positioned in the bottom right */}
        <div className="absolute bottom-2 right-2 bg-white/80 text-black font-bold px-3 py-1 rounded-full shadow">
          ${product.price.toFixed(2)}
        </div>
        
        {/* Stock indication */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            ¡Solo quedan {product.stockQuantity}!
          </div>
        )}
        {product.stockQuantity === 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Agotado
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-serif text-xl font-medium mb-2">{product.title}</h3>
        <p className="text-sm mb-3 line-clamp-2" style={{ opacity: 0.9 }}>{product.description || ''}</p>
        
        {availableSizes.length > 0 && product.stockQuantity > 0 ? (
          <>
            {adultSizes.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Tallas para adultos:</p>
                <div className="flex flex-wrap gap-2">
                  {adultSizes.map((size) => (
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
            )}
            
            {childSizes.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Tallas para niños:</p>
                <div className="flex flex-wrap gap-2">
                  {childSizes.map((size) => (
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
            )}
            
            <div className="mb-3">
              <p className="text-sm font-medium mb-1">Colores disponibles:</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      selectedColor === color.id
                        ? 'border-lilac transform scale-110'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                selectedSize && selectedColor
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
