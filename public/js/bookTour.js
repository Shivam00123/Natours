import { get_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

console.log("public", process.env.STRIPE_PUBLIC_KEY);

const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);

export const bookTour = async (tourId) => {
  try {
    const session = await get_fetchAPI(`bookings/checkout-session/${tourId}`);
    console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.session.id,
    });
  } catch (error) {
    console.log(error);
    Alert("error", "Something went wrong");
  }
};
