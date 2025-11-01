import { create } from 'zustand';

const useCartStore = create((set) => ({
  cartCount: 0,
  cartTotal: 0,
  
  setCart: (count, total) => set({ cartCount: count, cartTotal: total }),
  
  updateCart: (count, total) => set({ cartCount: count, cartTotal: total }),
  
  clearCart: () => set({ cartCount: 0, cartTotal: 0 }),
}));

export default useCartStore;
