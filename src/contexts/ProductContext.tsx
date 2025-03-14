
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, uploadImage } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';

export interface Size {
  id: string;
  name: string;
  available: boolean;
  isChildSize?: boolean;
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
  uploadProductImage: (file: File) => Promise<string>;
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

// Default products for fallback
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Camiseta Personalizada',
    description: 'Camiseta de algodón premium lista para personalizar con tu diseño favorito',
    price: 15.99,
    imageUrl: '/placeholder.svg',
    cardColor: '#C8B6E2', // Color por defecto (lila)
    stockQuantity: 25,
    colors: [
      { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
      { id: 'black', name: 'Negro', hex: '#000000' },
      { id: 'blue', name: 'Azul', hex: '#0EA5E9' }
    ],
    sizes: [
      { id: 's', name: 'S', available: true, isChildSize: false },
      { id: 'm', name: 'M', available: true, isChildSize: false },
      { id: 'l', name: 'L', available: true, isChildSize: false },
      { id: 'xl', name: 'XL', available: false, isChildSize: false },
      { id: 'child-s', name: 'S (Niño)', available: true, isChildSize: true },
      { id: 'child-m', name: 'M (Niño)', available: true, isChildSize: true },
    ]
  },
  {
    id: '2',
    title: 'Sudadera con Capucha',
    description: 'Sudadera cómoda y cálida, perfecta para estampados y bordados personalizados',
    price: 29.99,
    imageUrl: '/placeholder.svg',
    cardColor: '#E6DEFF', // Color lila claro
    stockQuantity: 15,
    colors: [
      { id: 'gray', name: 'Gris', hex: '#888888' },
      { id: 'black', name: 'Negro', hex: '#000000' }
    ],
    sizes: [
      { id: 's', name: 'S', available: false, isChildSize: false },
      { id: 'm', name: 'M', available: true, isChildSize: false },
      { id: 'l', name: 'L', available: true, isChildSize: false },
      { id: 'xl', name: 'XL', available: true, isChildSize: false },
      { id: 'child-s', name: 'S (Niño)', available: true, isChildSize: true },
      { id: 'child-m', name: 'M (Niño)', available: true, isChildSize: true },
    ]
  },
  {
    id: '3',
    title: 'Gorra Personalizada',
    description: 'Gorra de alta calidad para personalizar con tu logo o diseño preferido',
    price: 12.99,
    imageUrl: '/placeholder.svg',
    cardColor: '#A78BDA', // Color lila oscuro
    stockQuantity: 30,
    colors: [
      { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
      { id: 'red', name: 'Rojo', hex: '#EF4444' }
    ],
    sizes: [
      { id: 'uni', name: 'Única', available: true, isChildSize: false },
      { id: 'child-uni', name: 'Única (Niño)', available: true, isChildSize: true },
    ]
  }
];

// Convert our product model to Supabase format
const productToSupabase = (product: Omit<Product, 'id'> & { id?: string }) => {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    image_url: product.imageUrl,
    sizes: JSON.stringify(product.sizes),
    colors: JSON.stringify(product.colors),
    stock_quantity: product.stockQuantity,
    card_color: product.cardColor
  };
};

// Convert partial product (for updates) to Supabase format
const partialProductToSupabase = (product: Partial<Product> & { id?: string }) => {
  const result: Record<string, any> = {};
  
  if (product.id !== undefined) result.id = product.id;
  if (product.title !== undefined) result.title = product.title;
  if (product.description !== undefined) result.description = product.description;
  if (product.price !== undefined) result.price = product.price;
  if (product.imageUrl !== undefined) result.image_url = product.imageUrl;
  if (product.sizes !== undefined) result.sizes = JSON.stringify(product.sizes);
  if (product.colors !== undefined) result.colors = JSON.stringify(product.colors);
  if (product.stockQuantity !== undefined) result.stock_quantity = product.stockQuantity;
  if (product.cardColor !== undefined) result.card_color = product.cardColor;
  
  return result;
};

// Convert from Supabase format to our product model
const supabaseToProduct = (data: any): Product => {
  let sizes = data.sizes;
  let colors = data.colors;
  
  // Handle different data types from Supabase
  if (typeof sizes === 'string') {
    try {
      sizes = JSON.parse(sizes);
    } catch (e) {
      sizes = [];
    }
  }
  
  if (typeof colors === 'string') {
    try {
      colors = JSON.parse(colors);
    } catch (e) {
      colors = [];
    }
  }
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.price,
    imageUrl: data.image_url,
    sizes: sizes,
    colors: colors,
    stockQuantity: data.stock_quantity,
    cardColor: data.card_color
  };
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    // Fetch products from Supabase
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedProducts = data.map(supabaseToProduct);
          setProducts(formattedProducts);
        } else {
          // If no products in Supabase, check localStorage
          const storedProducts = localStorage.getItem('products');
          if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
          } else {
            // Use default products as fallback
            setProducts(DEFAULT_PRODUCTS);
            localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
            
            // If there are no products, try to seed the default ones to Supabase
            if (isAdmin) {
              try {
                await Promise.all(
                  DEFAULT_PRODUCTS.map(product => 
                    supabase.from('products').insert(productToSupabase(product))
                  )
                );
                console.log('Seeded default products to Supabase');
              } catch (seedError) {
                console.error('Failed to seed default products:', seedError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch products from Supabase:', error);
        
        // Fallback to localStorage
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          // Use default products
          setProducts(DEFAULT_PRODUCTS);
          localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [isAdmin]);

  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      return await uploadImage(file, 'product_images', 'products/');
    } catch (error) {
      console.error('Error uploading product image:', error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo cargar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'> & { id?: string }) => {
    const newProduct = {
      ...product,
      id: product.id || Date.now().toString()
    };
    
    // Add type assertion to resolve the TypeScript error
    const newProductAsProduct = newProduct as Product;
    
    // Update local state immediately
    const updatedProducts = [...products, newProductAsProduct];
    setProducts(updatedProducts);
    
    try {
      // Add to Supabase
      const supabaseData = productToSupabase(newProduct);
      const { error } = await supabase.from('products').insert(supabaseData);
      
      if (error) {
        console.error('Error adding product to Supabase:', error);
        toast({
          title: "Error al añadir producto",
          description: error.message,
          variant: "destructive",
        });
        
        // Fallback to localStorage
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        return;
      }
      
      toast({
        title: "Producto añadido",
        description: "El producto ha sido añadido correctamente.",
      });
    } catch (error) {
      console.error('Failed to add product to Supabase:', error);
      
      // Fallback to localStorage
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    // Update local state immediately
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, ...updates } : product
    );
    
    setProducts(updatedProducts);
    
    try {
      // Update in Supabase - Use the new partialProductToSupabase function
      const supabaseData = partialProductToSupabase({ id, ...updates });
      
      // Remove id from the data to update (we use it in the condition)
      delete supabaseData.id;
      
      const { error } = await supabase
        .from('products')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating product in Supabase:', error);
        toast({
          title: "Error al actualizar producto",
          description: error.message,
          variant: "destructive",
        });
        
        // Fallback to localStorage
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        return;
      }
      
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error('Failed to update product in Supabase:', error);
      
      // Fallback to localStorage
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }
  };

  const removeProduct = async (id: string) => {
    // Update local state immediately
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    
    try {
      // Remove from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error removing product from Supabase:', error);
        toast({
          title: "Error al eliminar producto",
          description: error.message,
          variant: "destructive",
        });
        
        // Fallback to localStorage
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        return;
      }
      
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
      });
    } catch (error) {
      console.error('Failed to remove product from Supabase:', error);
      
      // Fallback to localStorage
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      removeProduct,
      uploadProductImage,
      isLoading
    }}>
      {children}
    </ProductContext.Provider>
  );
};
