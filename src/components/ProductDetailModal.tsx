
import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from './ui/dialog';
import { Product } from '../contexts/ProductContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  open, 
  onOpenChange 
}) => {
  const [scale, setScale] = useState(1);
  
  if (!product) return null;
  
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1)); // Min zoom 1x
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white rounded-lg">
        <div className="relative">
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <button
              onClick={handleZoomOut}
              className="rounded-full bg-white/70 p-2 hover:bg-white shadow-md"
              disabled={scale === 1}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="rounded-full bg-white/70 p-2 hover:bg-white shadow-md"
              disabled={scale === 3}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <DialogClose className="rounded-full bg-white/70 p-2 hover:bg-white shadow-md">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
          
          <Carousel className="w-full">
            <CarouselContent className="h-full">
              {productImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="flex items-center justify-center p-4 h-[70vh] overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${product.title} - imagen ${index + 1}`} 
                      className="w-full h-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${scale})` }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {productImages.length > 1 && (
              <>
                <CarouselPrevious className="left-4 bg-white/80 hover:bg-white shadow-md h-10 w-10" />
                <CarouselNext className="right-4 bg-white/80 hover:bg-white shadow-md h-10 w-10" />
              </>
            )}
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
