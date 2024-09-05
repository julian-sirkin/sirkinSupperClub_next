"use client";

import { useCartStore } from "@/store/cartStore";

export const CartTotalDisplay = () => {
  const cart = useCartStore((state) => state.cart);

  return (
    <div className="text-white text-lg md:text-xl flex justify-end md:w-3/4">
      Total: ${cart.totalPrice}
    </div>
  );
};
