
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { Json } from '../integrations/supabase/types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  revalidateProducts: () => void;
  removeProduct: (id: string) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
  isLoading: boolean;
}

export interface Size {
  id: string;
  name: string;
  available: boolean;
  isChildSize: boolean;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  colors: Color[];
  sizes: Size[];
  stock?: number;
  featured?: boolean;
  newColorName?: string;
  newColorHex?: string;
  segments?: string[];
  imageUrl?: string;
  stockQuantity?: number;
  cardColor?: string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe ser usado dentro de un ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) {
          console.error('Error fetching products:', error);
          toast({
            title: "Error",
            description: "Failed to load products.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          // Transform database data to match Product interface
          const transformedProducts: Product[] = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            price: item.price,
            // Properly handle different types of images
            images: Array.isArray(item.images) 
              ? item.images.map(img => typeof img === 'string' ? img : '') 
              : (item.images ? [String(item.images)] : []),
            imageUrl: item.image_url,
            cardColor: item.card_color,
            stockQuantity: item.stock_quantity,
            // Properly cast colors and ensure they match the Color interface
            colors: Array.isArray(item.colors) 
              ? item.colors.map((color: any) => ({
                  id: String(color.id || ''),
                  name: String(color.name || ''),
                  hex: String(color.hex || '')
                }))
              : [],
            // Properly cast sizes and ensure they match the Size interface
            sizes: Array.isArray(item.sizes) 
              ? item.sizes.map((size: any) => ({
                  id: String(size.id || ''),
                  name: String(size.name || ''),
                  available: Boolean(size.available),
                  isChildSize: Boolean(size.isChildSize)
                }))
              : [],
            // Ensure segments is always an array of strings
            segments: Array.isArray(item.segments) 
              ? item.segments.map(seg => String(seg))
              : []
          }));
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Unexpected error fetching products:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading products.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast, isRevalidating]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProductId = uuidv4();
      const newProduct = { ...product, id: newProductId };

      // Prepare data for database format
      const dbProduct = {
        id: newProduct.id,
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price,
        images: newProduct.images,
        image_url: newProduct.imageUrl,
        card_color: newProduct.cardColor,
        stock_quantity: newProduct.stockQuantity || 0,
        colors: newProduct.colors as unknown as Json,
        sizes: newProduct.sizes as unknown as Json,
        segments: newProduct.segments || []
      };

      const { error } = await supabase
        .from('products')
        .insert(dbProduct);

      if (error) {
        console.error('Error adding product:', error);
        toast({
          title: "Error",
          description: "Failed to add product.",
          variant: "destructive",
        });
        return;
      }

      setProducts(prevProducts => [...prevProducts, newProduct]);
      toast({
        title: "Success",
        description: "Product added successfully.",
      });
    } catch (error) {
      console.error('Unexpected error adding product:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the product.",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      // Prepare updates for database format
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.cardColor !== undefined) dbUpdates.card_color = updates.cardColor;
      if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = updates.stockQuantity;
      if (updates.colors !== undefined) dbUpdates.colors = updates.colors as unknown as Json;
      if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes as unknown as Json;
      if (updates.segments !== undefined) dbUpdates.segments = updates.segments;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Error",
          description: "Failed to update product.",
          variant: "destructive",
        });
        return;
      }

      setProducts(prevProducts =>
        prevProducts.map(product => (product.id === id ? { ...product, ...updates } : product))
      );
      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
    } catch (error) {
      console.error('Unexpected error updating product:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the product.",
        variant: "destructive",
      });
    }
  };

  const removeProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product.",
          variant: "destructive",
        });
        return;
      }

      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    } catch (error) {
      console.error('Unexpected error deleting product:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the product.",
        variant: "destructive",
      });
    }
  };

  // Alias for removeProduct to maintain compatibility
  const deleteProduct = removeProduct;

  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      const filename = `${uuidv4()}-${file.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from('product_images')
        .upload(filename, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product_images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const revalidateProducts = () => {
    setIsRevalidating(prevState => !prevState);
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      revalidateProducts,
      removeProduct,
      uploadProductImage,
      isLoading
    }}>
      {children}
    </ProductContext.Provider>
  );
};
