import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@goMarketplace:products');
      setProducts(JSON.parse(String(data)));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      /**
       * Verify if the product already exist on the cart
       */
      const productExist = products.find(item => item.id === product.id);

      /**
       * Don´t add a new product on the cart, only change the quantity
       */
      if (productExist) {
        productExist.quantity += 1;
        const alteredProduts = products.map(item => {
          if (item.id === productExist.id) {
            return productExist;
          }
          return item;
        });
        setProducts(alteredProduts);
        /**
         * Save the product on Async Storage
         */
        await AsyncStorage.setItem(
          '@goMarketplace:products',
          JSON.stringify(products),
        );
      } else {
        /**
         * New product, add the product information and the quantity
         */
        const product_with_quantity = { ...product, quantity: 1 };

        /**
         * save the new product on the cart with the others.
         */
        setProducts([...products, product_with_quantity]);

        /**
         * Save the product on Async Storage
         */
        await AsyncStorage.setItem(
          '@goMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productToIncrement = products.find(item => item.id === id);

      if (productToIncrement) {
        productToIncrement.quantity += 1;
        const alteredProduts = products.map(item => {
          if (item.id === productToIncrement.id) {
            return productToIncrement;
          }
          return item;
        });
        setProducts(alteredProduts);
        /**
         * Save the product on Async Storage
         */
        await AsyncStorage.setItem(
          '@goMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productToDecrement = products.find(item => item.id === id);

      if (productToDecrement) {
        productToDecrement.quantity -= 1;

        const alteredProduts = products.map(item => {
          if (item.id === productToDecrement.id) {
            return productToDecrement;
          }

          return item;
        });
        setProducts(alteredProduts);
        /**
         * Save the product on Async Storage
         */
        await AsyncStorage.setItem(
          '@goMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
