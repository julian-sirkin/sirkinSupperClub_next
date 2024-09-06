import { useCartStore } from "@/store/cartStore";

export const CheckoutSuccessMessage = () => {
  const cart = useCartStore((state) => state.cart);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gold mb-4">Order Successful!</h2>
      <p className="mb-4">
        Thank you for your purchase. Your tickets are confirmed. Check your
        email for a confirmation, and expect a follow up shortly before the
        event to share the location.
      </p>
      <p className="mb-4">
        If you have any questions, please reach out via{" "}
        <a
          href="mailto:sirkinsupperclub@gmail.com"
          className="text-gold hover:underline"
        >
          email
        </a>
        , or{" "}
        <a
          href="https://www.instagram.com/julian-sirkin"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          Instagram
        </a>
      </p>

      <div className="mt-6">
        <p className="mb-2">Please complete your payment via Venmo:</p>
        <a
          href="https://venmo.com/julian-sirkin"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold text-2xl hover:underline"
        >
          Pay with Venmo
        </a>
      </div>
    </div>
  );
};
