
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
  featured: boolean;
}

interface ProductContextType {
  products: Product[];
  featuredProducts: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Camiseta Personalizada',
    description: 'Camiseta de algodón premium con posibilidad de personalización completa.',
    price: 25.99,
    imageUrl: '/placeholder1.jpg',
    sizes: [
      { id: 's', name: 'S', available: true },
      { id: 'm', name: 'M', available: true },
      { id: 'l', name: 'L', available: true },
      { id: 'xl', name: 'XL', available: false },
    ],
    featured: true,
  },
  {
    id: '2',
    title: 'Sudadera con Capucha',
    description: 'Sudadera cómoda y elegante perfecta para personalizar con tu estilo único.',
    price: 39.99,
    imageUrl: '/placeholder2.jpg',
    sizes: [
      { id: 's', name: 'S', available: true },
      { id: 'm', name: 'M', available: true },
      { id: 'l', name: 'L', available: true },
      { id: 'xl', name: 'XL', available: true },
    ],
    featured: true,
  },
  {
    id: '3',
    title: 'Pantalones Deportivos',
    description: 'Pantalones deportivos con opciones de personalización y alta calidad.',
    price: 32.50,
    imageUrl: '/placeholder3.jpg',
    sizes: [
      { id: 's', name: 'S', available: false },
      { id: 'm', name: 'M', available: true },
      { id: 'l', name: 'L', available: true },
      { id: 'xl', name: 'XL', available: true },
    ],
    featured: false,
  },
  {
    id: '4',
    title: 'Gorra Estampada',
    description: 'Gorra con posibilidad de personalización y ajuste perfecto.',
    price: 18.99,
    imageUrl: '/placeholder4.jpg',
    sizes: [
      { id: 'unique', name: 'Única', available: true },
    ],
    featured: true,
  }
];

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
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
    }
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, ...updates } : product
    );
    saveProducts(updatedProducts);
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    saveProducts(updatedProducts);
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const featuredProducts = products.filter(product => product.featured);

  return (
    <ProductContext.Provider
      value={{
        products,
        featuredProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
