
import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from './ui/dialog';
import { Product, Color } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, open, onOpenChange }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = React.useState<string>('');
  const [selectedColor, setSelectedColor] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (open && product) {
      // Reset selections when modal opens
      setSelectedSize('');
      setSelectedColor('');
      setQuantity(1);
      
      // Default to first available size and color
      const firstAvailableSize = product.sizes.find(size => size.available);
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize.id);
      }
      
      if (product.colors.length > 0) {
        setSelectedColor(product.colors[0].id);
      }
    }
  }, [open, product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      addToCart(product, selectedSize, selectedColor, quantity);
      onOpenChange(false);
    }
  };

  const adultSizes = product.sizes.filter(size => !size.isChildSize && size.available);
  const kidSizes = product.sizes.filter(size => size.isChildSize && size.available);
  
  // Use product images or fallback to the main image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row max-h-[80vh]">
          <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {productImages.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <div className="h-full flex items-center justify-center p-2">
                      <img 
                        src={image} 
                        alt={`${product.title} - imagen ${index + 1}`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {productImages.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </div>
          
          <div className="w-full md:w-1/2 p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <DialogTitle className="text-2xl font-serif">{product.title}</DialogTitle>
              <DialogClose className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </DialogClose>
            </div>
            
            <DialogDescription className="mb-4">
              {product.description}
            </DialogDescription>
            
            <div className="mb-6">
              <p className="text-2xl font-bold text-lilac-dark">${product.price.toFixed(2)}</p>
              {product.stockQuantity > 0 ? (
                <p className="text-sm text-green-600">En stock: {product.stockQuantity}</p>
              ) : (
                <p className="text-sm text-red-600">Agotado</p>
              )}
            </div>
            
            {adultSizes.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Tallas para adultos:</h4>
                <div className="flex flex-wrap gap-2">
                  {adultSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Tallas para niños:</h4>
                <div className="flex flex-wrap gap-2">
                  {kidSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Colores:</h4>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: Color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
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
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Cantidad:</h4>
              <div className="flex items-center w-32 border rounded-md overflow-hidden">
                <button
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <div className="flex-1 text-center py-1">{quantity}</div>
                <button
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                >
                  +
                </button>
              </div>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor || product.stockQuantity <= 0}
              className="w-full bg-lilac hover:bg-lilac-dark"
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Añadir al carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
