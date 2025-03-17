
import React from 'react';
import { X } from 'lucide-react';
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
  if (!product) return null;
  
  // Use product images or fallback to the main image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-white">
        <div className="relative">
          <DialogClose className="absolute right-2 top-2 z-10 rounded-full bg-white/70 p-1 hover:bg-white">
            <X className="h-5 w-5" />
          </DialogClose>
          
          <Carousel className="w-full">
            <CarouselContent className="h-full">
              {productImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="flex items-center justify-center p-2 h-[60vh]">
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
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
