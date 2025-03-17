
import React, { useState } from 'react';
import { ShoppingCart, Heart, Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import ProductDetailModal from './ProductDetailModal';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Get available sizes
  const availableSizes = product.sizes?.filter(s => s.available) || [];
  const adultSizes = availableSizes.filter(s => !s.isChildSize);
  const kidSizes = availableSizes.filter(s => s.isChildSize);

  // Handle add to cart
  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      addToCart(product, selectedSize, selectedColor, quantity);
      setSelectedSize('');
      setSelectedColor('');
      setQuantity(1);
    }
  };

  // Get product images with fallback to the main image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : ['/placeholder.svg']);

  // Handle image navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
      <Card 
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'shadow-lg' : 'shadow-md hover:shadow-lg'
        }`}
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
              Ver imágenes
            </button>
          </div>
        </div>

        <CardHeader className="p-3 pb-0">
          <CardTitle className="font-medium text-lg mb-1 text-lilac-dark">{product.title}</CardTitle>
          <CardDescription className="text-sm text-gray-600 mb-2">{product.description}</CardDescription>
          <p className="font-bold text-lg mb-2">${product.price.toFixed(2)}</p>
        </CardHeader>
        
        <CardContent className="p-3 pt-2">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-lilac-dark mb-2 hover:underline cursor-pointer"
          >
            {expanded ? 'Mostrar menos' : 'Mostrar opciones'}
          </button>
          
          {expanded && (
            <div className="space-y-3 pt-2">
              {adultSizes.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-1">Tallas para adultos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {adultSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          selectedSize === size.id
                            ? 'bg-lilac text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {kidSizes.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-1">Tallas para niños:</h4>
                  <div className="flex flex-wrap gap-1">
                    {kidSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          selectedSize === size.id
                            ? 'bg-lilac text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-xs font-medium mb-1">Colores:</h4>
                <div className="flex flex-wrap gap-1">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color.id
                          ? 'border-lilac scale-110'
                          : 'border-transparent scale-100 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-1">Cantidad:</h4>
                <div className="flex items-center w-24 border rounded-md overflow-hidden">
                  <button
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center text-sm py-1">{quantity}</div>
                  <button
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-3 pt-0">
          <Button 
            onClick={handleAddToCart}
            disabled={!selectedSize || !selectedColor || product.stockQuantity <= 0}
            className="w-full bg-lilac hover:bg-lilac-dark flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {expanded ? 'Añadir al carrito' : 'Comprar'}
          </Button>
        </CardFooter>
      </Card>

      {/* Product Detail Modal - Only shows images */}
      <ProductDetailModal
        product={product}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </>
  );
};

export default ProductCard;
