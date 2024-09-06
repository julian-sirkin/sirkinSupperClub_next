import { useCartStore } from "@/store/cartStore";

export const CheckoutResponseMessage = ({
  showErrorMessage,
}: {
  showErrorMessage: boolean;
}) => {
  const cart = useCartStore((state) => state.cart);

  return (
    <>
      {showErrorMessage ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Unable to Process Order
          </h2>
          <p className="mb-4">
            We apologize, but we were unable to process your order. This is
            likely due to insufficient seat availability.
          </p>
          <p className="mb-4">You can try the following:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Reduce the number of seats in your order</li>
            <li>Choose a different event slot if available</li>
            <li>Reach out to us for assistance</li>
          </ul>
          <p className="mb-4">
            If you need further help, please contact us via{" "}
            <a
              href="mailto:sirkinsupperclub@gmail.com"
              className="text-gold hover:underline"
            >
              email
            </a>{" "}
            or{" "}
            <a
              href="https://www.instagram.com/julian-sirkin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Instagram
            </a>
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gold mb-4">
            Order Successful!
          </h2>
          <p className="mb-4">
            Thank you for your purchase. Your tickets are confirmed. Check your
            email for a confirmation, and expect a follow up shortly before the
            event to share the location.
          </p>
          <p className="mb-4">
            If you have any questions, please reach out via{" "}
            <a
              href="mailto:sirkinsupperclub@gmail.com"
              className="text-gold hov  setShowErrorMessage(true);
    setTimeout(() => {
      setShowErrorMessage(false);
    }, 15000);er:underline"
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
      )}
    </>
  );
};
