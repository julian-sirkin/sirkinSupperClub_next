import { AdminPurchase } from "@/app/api/api.types";
import { useState } from "react";

export const AdminRefundForm = ({order}: {order: AdminPurchase}) => {
  const [refundQuantity, setRefundQuantity] = useState<number>();

  const handleRefundSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e);
  };
  return (
    <form className="flex gap-4" onSubmit={handleRefundSubmit}>
    <input
      className="bg-white text-black w-8 text-center text-2xl"
      type="number"
      value={refundQuantity}
      onChange={(e) => setRefundQuantity(Number(e.currentTarget.value))}
      max={Number(order.quantity)}
    />
    <button className="bg-gold p-2 font-bold" type="submit">
      Refund
    </button>
  </form>
  );
};
