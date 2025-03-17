
import React, { useState } from 'react';
import { ShoppingCart, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from './ui/carousel';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const availableSizes = product.sizes.filter(size => size.available);
  
  // Separando tamanhos para adultos e crianças
  const adultSizes = availableSizes.filter(size => !size.isChildSize);
  const childSizes = availableSizes.filter(size => size.isChildSize === true);
  
  // Usar a lista de imagens do produto ou criar um array com imageUrl como único elemento
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : ['/placeholder.svg']);
  
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
    <>
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
          {/* Carrossel de imagens */}
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {productImages.map((img, index) => (
                <CarouselItem key={index} className="h-full">
                  <img 
                    src={img || '/placeholder.svg'} 
                    alt={`${product.title} - Imagem ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 transform group-hover:scale-105"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {productImages.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8 opacity-70" />
                <CarouselNext className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 opacity-70" />
              </>
            )}
          </Carousel>
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-70' : 'opacity-0'}`}></div>
          
          {/* Ícone de lupa para abrir modal */}
          <button 
            className="absolute top-2 right-2 bg-white/80 text-gray-800 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => setModalOpen(true)}
            aria-label="Ver detalhes"
          >
            <Search className="h-4 w-4" />
          </button>
          
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
      
      {/* Modal de detalhes do produto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle className="text-2xl font-serif">{product.title}</DialogTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            {/* Carrossel de imagens no modal */}
            <div className="overflow-hidden rounded-lg">
              <Carousel className="w-full">
                <CarouselContent>
                  {productImages.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <img 
                          src={img || '/placeholder.svg'} 
                          alt={`${product.title} - Imagem ${index + 1}`} 
                          className="w-full h-[300px] object-cover rounded-md"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {productImages.length > 1 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            </div>
            
            {/* Informações detalhadas do produto */}
            <div>
              <h3 className="text-2xl font-bold mb-2">${product.price.toFixed(2)}</h3>
              <p className="text-gray-700 mb-4">{product.description}</p>
              
              {/* Informação de estoque */}
              <div className="mb-4">
                {product.stockQuantity > 0 ? (
                  <p className="text-green-600">
                    En stock ({product.stockQuantity} disponibles)
                  </p>
                ) : (
                  <p className="text-red-500 font-medium">Agotado</p>
                )}
              </div>
              
              {/* Tallas */}
              {availableSizes.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Tallas disponibles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-1 text-sm font-medium rounded border transition-colors ${
                          selectedSize === size.id
                            ? 'bg-lilac text-white border-lilac'
                            : 'bg-white text-gray-800 border-gray-300 hover:border-lilac'
                        }`}
                      >
                        {size.name}
                        {size.isChildSize ? ' (Niño)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Colores */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Colores disponibles:</h4>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-10 h-10 rounded-full border-2 transition-transform ${
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
              
              {/* Botão de adicionar ao carrinho */}
              {product.stockQuantity > 0 && (
                <button
                  onClick={() => {
                    handleAddToCart();
                    setModalOpen(false);
                  }}
                  disabled={!selectedSize || !selectedColor}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                    selectedSize && selectedColor
                      ? 'bg-lilac hover:bg-lilac-dark text-black font-bold'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Agregar al carrito</span>
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
