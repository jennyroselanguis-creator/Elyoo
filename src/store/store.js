import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isAdminRole, isStaffRole } from '../utils/roles';
import { clearAuthToken } from '../utils/security';

export const useStore = create(
  persist(
    (set, get) => ({
      cart: [],
      brands: [],
      products: [],
      selectedBrand: null,
      searchQuery: '',
      priceRange: [10000, 100000],
      user: null,
      isStaff: false,
      isAdmin: false,
      supabaseConnected: false,
      supabaseVerified: false,
      supabaseSource: null,
      supabaseError: null,

      addToCart: (product, quantity) =>
        set((state) => {
          const maxStock = Math.max(0, parseInt(product.stock, 10) || 0);
          if (maxStock <= 0) return state;
          const addQty = Math.min(Math.max(1, parseInt(quantity, 10) || 1), maxStock);
          const existingItem = state.cart.find((item) => item.id === product.id);
          if (existingItem) {
            const newQty = Math.min(existingItem.quantity + addQty, maxStock);
            return {
              cart: state.cart.map((item) =>
                item.id === product.id ? { ...item, quantity: newQty, stock: maxStock } : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: addQty, stock: maxStock }] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== productId) })),

      updateCartQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id !== productId) return item;
            const maxStock = Math.max(1, parseInt(item.stock, 10) || 99);
            const q = Math.min(Math.max(1, parseInt(quantity, 10) || 1), maxStock);
            return { ...item, quantity: q };
          }),
        })),

      clearCart: () => set({ cart: [] }),

      setProducts: (products) => set({ products }),
      refreshProducts: async () => {
        try {
          const { productAPI } = await import('../api/client');
          const res = await productAPI.getAll();
          const list = Array.isArray(res.data.data) ? res.data.data : [];
          set({ products: list });
        } catch (err) {
          console.warn('Product refresh failed:', err);
        }
      },
      setBrands: (brands) => set({ brands }),
      setSelectedBrand: (brandId) => set({ selectedBrand: brandId }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setPriceRange: (priceRange) => set({ priceRange }),

      setSupabaseStatus: (connected, source = null, error = null) =>
        set({
          supabaseConnected: connected,
          supabaseVerified: Boolean(connected),
          supabaseSource: source,
          supabaseError: error,
        }),

      setUser: (user) =>
        set({
          user,
          isStaff: Boolean(user && isStaffRole(user.role)),
          isAdmin: Boolean(user && isAdminRole(user.role)),
        }),

      logout: () => {
        clearAuthToken();
        set({ user: null, isStaff: false, isAdmin: false });
      },

      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'elyoo-cart',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
