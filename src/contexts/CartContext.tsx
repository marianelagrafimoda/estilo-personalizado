
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './ProductContext';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Json } from '../integrations/supabase/types';

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedSize: string, selectedColor: string) => void;
  removeFromCart: (productId: string, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (productId: string, selectedSize: string, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  
  // Load cart data when user changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (user) {
          // If user is logged in, try to fetch their cart from Supabase
          const { data, error } = await supabase
            .from('user_carts')
            .select('cart_data')
            .eq('user_email', user.email)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching cart:', error);
            throw error;
          }
          
          if (data?.cart_data) {
            // Parse the cart data - it's already a JSON object from Supabase
            setItems(data.cart_data as unknown as CartItem[]);
            return;
          }
        }
        
        // Fallback to localStorage if not logged in or no cart in Supabase
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          setItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        
        // Fallback to localStorage
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          setItems(JSON.parse(storedCart));
        }
      }
    };
    
    loadCart();
  }, [user]);

  // Save cart whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      // Always save to localStorage as fallback
      localStorage.setItem('cart', JSON.stringify(items));
      
      // If user is logged in, also save to Supabase
      if (user) {
        try {
          const { data, error: fetchError } = await supabase
            .from('user_carts')
            .select('id')
            .eq('user_email', user.email)
            .single();
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking existing cart:', fetchError);
          }
          
          // Convert CartItem[] to a format acceptable for Json type
          const cartDataJson = JSON.parse(JSON.stringify(items)) as Json;
          
          if (data) {
            // Update existing cart
            const { error: updateError } = await supabase
              .from('user_carts')
              .update({ cart_data: cartDataJson })
              .eq('id', data.id);
            
            if (updateError) {
              console.error('Error updating cart in Supabase:', updateError);
            }
          } else {
            // Insert new cart
            const { error: insertError } = await supabase
              .from('user_carts')
              .insert({ 
                user_email: user.email,
                cart_data: cartDataJson
              });
            
            if (insertError) {
              console.error('Error inserting cart in Supabase:', insertError);
            }
          }
        } catch (error) {
          console.error('Failed to save cart to Supabase:', error);
        }
      }
    };
    
    if (items.length > 0) {
      saveCart();
    }
  }, [items, user]);

  const addToCart = (product: Product, selectedSize: string, selectedColor: string) => {
    // Check if item with same product, size and color already exists
    const existingItemIndex = items.findIndex(
      item => item.product.id === product.id && 
              item.selectedSize === selectedSize && 
              item.selectedColor === selectedColor
    );

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([...items, { product, quantity: 1, selectedSize, selectedColor }]);
    }
  };

  const removeFromCart = (productId: string, selectedSize: string, selectedColor: string) => {
    setItems(items.filter(
      item => !(
        item.product.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
      )
    ));
  };

  const updateQuantity = (productId: string, selectedSize: string, selectedColor: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }

    setItems(items.map(item => 
      (item.product.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    
    // When clearing cart, also remove from Supabase if user is logged in
    if (user) {
      try {
        supabase
          .from('user_carts')
          .delete()
          .eq('user_email', user.email)
          .then(({ error }) => {
            if (error) {
              console.error('Error clearing cart from Supabase:', error);
            }
          });
      } catch (error) {
        console.error('Failed to clear cart from Supabase:', error);
      }
    }
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
