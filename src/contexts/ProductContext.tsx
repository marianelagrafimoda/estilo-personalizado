
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Size {
  id: string;
  name: string;
  available: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  sizes: Size[];
  cardColor: string; // Nueva propiedad para el color
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
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
  
  useEffect(() => {
    // Load products from localStorage or use defaults
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Default products
      const defaultProducts: Product[] = [
        {
          id: '1',
          title: 'Camiseta Personalizada',
          description: 'Camiseta de algodón premium lista para personalizar con tu diseño favorito',
          price: 15.99,
          imageUrl: '/placeholder.svg',
          cardColor: '#C8B6E2', // Color por defecto (lila)
          sizes: [
            { id: 's', name: 'S', available: true },
            { id: 'm', name: 'M', available: true },
            { id: 'l', name: 'L', available: true },
            { id: 'xl', name: 'XL', available: false }
          ]
        },
        {
          id: '2',
          title: 'Sudadera con Capucha',
          description: 'Sudadera cómoda y cálida, perfecta para estampados y bordados personalizados',
          price: 29.99,
          imageUrl: '/placeholder.svg',
          cardColor: '#E6DEFF', // Color lila claro
          sizes: [
            { id: 's', name: 'S', available: false },
            { id: 'm', name: 'M', available: true },
            { id: 'l', name: 'L', available: true },
            { id: 'xl', name: 'XL', available: true }
          ]
        },
        {
          id: '3',
          title: 'Gorra Personalizada',
          description: 'Gorra de alta calidad para personalizar con tu logo o diseño preferido',
          price: 12.99,
          imageUrl: '/placeholder.svg',
          cardColor: '#A78BDA', // Color lila oscuro
          sizes: [
            { id: 'uni', name: 'Única', available: true }
          ]
        }
      ];
      
      setProducts(defaultProducts);
      localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
  }, []);

  const addProduct = (product: Omit<Product, 'id'> & { id?: string }) => {
    const newProduct = {
      ...product,
      id: product.id || Date.now().toString()
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, ...updates } : product
    );
    
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const removeProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, removeProduct }}>
      {children}
    </ProductContext.Provider>
  );
};
