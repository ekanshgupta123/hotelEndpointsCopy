import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements 
} from "@stripe/react-stripe-js";

type CheckoutProps = {
  clientSecret: string;
  paymentID: string;
  nav: string | string[] | undefined;
};

const CheckoutForm: React.FC<CheckoutProps> = ({ clientSecret, paymentID, nav }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!stripe || !clientSecret || !paymentID) return
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!stripe || !elements) return

      setIsLoading(true);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `http://localhost:3000/confirmation/?payID=${paymentID}&nav=${nav}`,
        },
      });

      console.log(error);

      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message!);
      } else {
        setMessage("An unexpected error occurred.");
      };

      setIsLoading(false);
    } catch (e) {
      console.error(e);
    };
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>

      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

export default CheckoutForm;