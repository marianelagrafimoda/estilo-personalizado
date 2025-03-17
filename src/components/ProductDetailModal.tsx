
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
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white rounded-lg">
        <div className="relative">
          <DialogClose className="absolute right-4 top-4 z-10 rounded-full bg-white/70 p-2 hover:bg-white shadow-md">
            <X className="h-5 w-5" />
          </DialogClose>
          
          <Carousel className="w-full">
            <CarouselContent className="h-full">
              {productImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="flex items-center justify-center p-4 h-[70vh]">
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
