import { useStore } from '../store/store';

export const useCart = () => {
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart } = useStore();

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return {
    cart,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  };
};

export default useCart;
