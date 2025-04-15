import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  revalidateProducts: () => void;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock?: number;
  featured?: boolean;
  newColorName?: string; // Add this field
  newColorHex?: string;  // Add this field
  segments?: string[];   // Keep the segments field
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
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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
        }

        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching products:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading products.",
          variant: "destructive",
        });
      }
    };

    fetchProducts();
  }, [toast, isRevalidating]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProductId = uuidv4();
      const newProduct = { ...product, id: newProductId };

      const { error } = await supabase
        .from('products')
        .insert([newProduct]);

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
      const { error } = await supabase
        .from('products')
        .update(updates)
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

  const deleteProduct = async (id: string) => {
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

  const revalidateProducts = () => {
    setIsRevalidating(prevState => !prevState);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, revalidateProducts }}>
      {children}
    </ProductContext.Provider>
  );
};
