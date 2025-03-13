
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

export interface Size {
  id: string;
  name: string;
  available: boolean;
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
  imageUrl: string;
  sizes: Size[];
  colors: Color[];
  stockQuantity: number;
  cardColor: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching products...');
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          toast({
            title: "Error",
            description: `Error al cargar productos: ${error.message}`,
            variant: "destructive",
            duration: 5000,
          });
          return;
        }

        console.log('Products data from Supabase:', data);
        
        if (data && data.length > 0) {
          const formattedProducts = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: Number(item.price),
            imageUrl: item.image_url,
            cardColor: item.card_color,
            stockQuantity: item.stock_quantity,
            sizes: typeof item.sizes === 'string' ? JSON.parse(item.sizes) : item.sizes,
            colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors,
          }));
          
          setProducts(formattedProducts);
          console.log('Formatted products:', formattedProducts);
        } else {
          // If no products in the database, create default products
          await createDefaultProducts();
        }
      } catch (error: any) {
        console.error('Error processing products:', error);
        toast({
          title: "Error",
          description: `Error inesperado: ${error.message || 'Error desconocido'}`,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Function to create default products
  const createDefaultProducts = async () => {
    try {
      console.log('Creating default products...');
      const defaultProducts = [
        {
          title: 'Camiseta Personalizada',
          description: 'Camiseta de algodón premium lista para personalizar con tu diseño favorito',
          price: 15.99,
          image_url: '/placeholder.svg',
          card_color: '#C8B6E2', // Color por defecto (lila)
          stock_quantity: 25,
          colors: JSON.stringify([
            { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
            { id: 'black', name: 'Negro', hex: '#000000' },
            { id: 'blue', name: 'Azul', hex: '#0EA5E9' }
          ]),
          sizes: JSON.stringify([
            { id: 's', name: 'S', available: true },
            { id: 'm', name: 'M', available: true },
            { id: 'l', name: 'L', available: true },
            { id: 'xl', name: 'XL', available: false }
          ])
        },
        {
          title: 'Sudadera con Capucha',
          description: 'Sudadera cómoda y cálida, perfecta para estampados y bordados personalizados',
          price: 29.99,
          image_url: '/placeholder.svg',
          card_color: '#E6DEFF', // Color lila claro
          stock_quantity: 15,
          colors: JSON.stringify([
            { id: 'gray', name: 'Gris', hex: '#888888' },
            { id: 'black', name: 'Negro', hex: '#000000' }
          ]),
          sizes: JSON.stringify([
            { id: 's', name: 'S', available: false },
            { id: 'm', name: 'M', available: true },
            { id: 'l', name: 'L', available: true },
            { id: 'xl', name: 'XL', available: true }
          ])
        },
        {
          title: 'Gorra Personalizada',
          description: 'Gorra de alta calidad para personalizar con tu logo o diseño preferido',
          price: 12.99,
          image_url: '/placeholder.svg',
          card_color: '#A78BDA', // Color lila oscuro
          stock_quantity: 30,
          colors: JSON.stringify([
            { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
            { id: 'red', name: 'Rojo', hex: '#EF4444' }
          ]),
          sizes: JSON.stringify([
            { id: 'uni', name: 'Única', available: true }
          ])
        }
      ];
      
      // Save default products to Supabase
      for (const product of defaultProducts) {
        await addProductToSupabase(product);
      }
      
      // Fetch products again to get the IDs generated
      const { data: newData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (newData && newData.length > 0) {
        const formattedProducts = newData.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: Number(item.price),
          imageUrl: item.image_url,
          cardColor: item.card_color,
          stockQuantity: item.stock_quantity,
          sizes: typeof item.sizes === 'string' ? JSON.parse(item.sizes) : item.sizes,
          colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors,
        }));
        
        setProducts(formattedProducts);
        console.log('Created default products:', formattedProducts);
      }
    } catch (error: any) {
      console.error('Error creating default products:', error);
      toast({
        title: "Error",
        description: `Error al crear productos por defecto: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Helper function to add product to Supabase
  const addProductToSupabase = async (product: any) => {
    try {
      console.log('Adding product to Supabase:', product);
      
      const { error } = await supabase
        .from('products')
        .insert(product);
        
      if (error) {
        console.error('Error adding product to Supabase:', error);
        throw error;
      }
      
      console.log('Product added successfully');
    } catch (error) {
      console.error('Error in addProductToSupabase:', error);
      throw error;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'> & { id?: string }) => {
    try {
      setIsLoading(true);
      console.log('Adding new product:', product);
      
      // Map from our client model to the database model and stringify arrays
      const dbProduct = {
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl,
        card_color: product.cardColor,
        stock_quantity: product.stockQuantity,
        sizes: JSON.stringify(product.sizes),
        colors: JSON.stringify(product.colors)
      };
      
      console.log('Prepared product for database:', dbProduct);
      
      const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select();
      
      if (error) {
        console.error('Error inserting product:', error);
        throw error;
      }
      
      console.log('Insert response:', data);
      
      if (data && data.length > 0) {
        const newProduct = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          price: Number(data[0].price),
          imageUrl: data[0].image_url,
          cardColor: data[0].card_color,
          stockQuantity: data[0].stock_quantity,
          sizes: typeof data[0].sizes === 'string' ? JSON.parse(data[0].sizes) : data[0].sizes,
          colors: typeof data[0].colors === 'string' ? JSON.parse(data[0].colors) : data[0].colors,
        };
        
        setProducts(prevProducts => [...prevProducts, newProduct]);
        
        toast({
          title: "Producto adicionado",
          description: "El producto fue adicionado con éxito",
          duration: 3000,
        });
        
        console.log('Product added successfully:', newProduct);
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: `Error al adicionar producto: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      setIsLoading(true);
      console.log('Updating product:', id, updates);
      
      // Convert to database format
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.cardColor !== undefined) dbUpdates.card_color = updates.cardColor;
      if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = updates.stockQuantity;
      if (updates.sizes !== undefined) dbUpdates.sizes = JSON.stringify(updates.sizes);
      if (updates.colors !== undefined) dbUpdates.colors = JSON.stringify(updates.colors);
      
      console.log('Prepared updates for database:', dbUpdates);
      
      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id ? { ...product, ...updates } : product
        )
      );
      
      toast({
        title: "Producto actualizado",
        description: "El producto fue actualizado con éxito",
        duration: 3000,
      });
      
      console.log('Product updated successfully');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: `Error al actualizar producto: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeProduct = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('Removing product:', id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error removing product:', error);
        throw error;
      }
      
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== id)
      );
      
      toast({
        title: "Producto removido",
        description: "El producto fue removido con éxito",
        duration: 3000,
      });
      
      console.log('Product removed successfully');
    } catch (error: any) {
      console.error('Error removing product:', error);
      toast({
        title: "Error",
        description: `Error al remover producto: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, removeProduct, isLoading }}>
      {children}
    </ProductContext.Provider>
  );
};
