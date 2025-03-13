
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
  
  // Carregar produtos do Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar produtos:', error);
          setIsLoading(false);
          return;
        }

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
        } else {
          // Se não houver produtos no banco, criar produtos padrão
          const defaultProducts = [
            {
              title: 'Camiseta Personalizada',
              description: 'Camiseta de algodón premium lista para personalizar con tu diseño favorito',
              price: 15.99,
              image_url: '/placeholder.svg',
              card_color: '#C8B6E2', // Color por defecto (lila)
              stock_quantity: 25,
              colors: [
                { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
                { id: 'black', name: 'Negro', hex: '#000000' },
                { id: 'blue', name: 'Azul', hex: '#0EA5E9' }
              ],
              sizes: [
                { id: 's', name: 'S', available: true },
                { id: 'm', name: 'M', available: true },
                { id: 'l', name: 'L', available: true },
                { id: 'xl', name: 'XL', available: false }
              ]
            },
            {
              title: 'Sudadera con Capucha',
              description: 'Sudadera cómoda y cálida, perfecta para estampados y bordados personalizados',
              price: 29.99,
              image_url: '/placeholder.svg',
              card_color: '#E6DEFF', // Color lila claro
              stock_quantity: 15,
              colors: [
                { id: 'gray', name: 'Gris', hex: '#888888' },
                { id: 'black', name: 'Negro', hex: '#000000' }
              ],
              sizes: [
                { id: 's', name: 'S', available: false },
                { id: 'm', name: 'M', available: true },
                { id: 'l', name: 'L', available: true },
                { id: 'xl', name: 'XL', available: true }
              ]
            },
            {
              title: 'Gorra Personalizada',
              description: 'Gorra de alta calidad para personalizar con tu logo o diseño preferido',
              price: 12.99,
              image_url: '/placeholder.svg',
              card_color: '#A78BDA', // Color lila oscuro
              stock_quantity: 30,
              colors: [
                { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
                { id: 'red', name: 'Rojo', hex: '#EF4444' }
              ],
              sizes: [
                { id: 'uni', name: 'Única', available: true }
              ]
            }
          ];
          
          // Salvamos produtos por padrão no Supabase
          for (const product of defaultProducts) {
            await addProductToSupabase(product);
          }
          
          // Buscamos novamente para obter os IDs gerados
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
          }
        }
      } catch (error) {
        console.error('Erro ao processar produtos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Função auxiliar para adicionar produto ao Supabase
  const addProductToSupabase = async (product: any) => {
    const { error } = await supabase
      .from('products')
      .insert({
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        card_color: product.card_color,
        stock_quantity: product.stock_quantity,
        sizes: product.sizes,
        colors: product.colors
      });
      
    if (error) {
      console.error('Erro ao adicionar produto ao Supabase:', error);
      throw error;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'> & { id?: string }) => {
    try {
      setIsLoading(true);
      
      // Map from our client model to the database model
      const dbProduct = {
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl,
        card_color: product.cardColor,
        stock_quantity: product.stockQuantity,
        sizes: product.sizes,
        colors: product.colors
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select();
      
      if (error) throw error;
      
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
          title: "Produto adicionado",
          description: "O produto foi adicionado com sucesso",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro",
        description: `Falha ao adicionar produto: ${error.message || 'Erro desconhecido'}`,
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
      
      // Converter para o formato do banco de dados
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.cardColor !== undefined) dbUpdates.card_color = updates.cardColor;
      if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = updates.stockQuantity;
      if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
      if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
      
      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id ? { ...product, ...updates } : product
        )
      );
      
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: `Falha ao atualizar produto: ${error.message || 'Erro desconhecido'}`,
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
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== id)
      );
      
      toast({
        title: "Produto removido",
        description: "O produto foi removido com sucesso",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Erro ao remover produto:', error);
      toast({
        title: "Erro",
        description: `Falha ao remover produto: ${error.message || 'Erro desconhecido'}`,
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
