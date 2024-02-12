import { get_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

const stripe = Stripe(
  "pk_test_51Oh52DSD6i3At0OCTRdxa48AXpeo7ZuJvTufCo5ViW8BEIfVmJGUfQGaEaLKvZPbc6zaifVrphwDB4l3l3ast3bp001ewqBDYU"
);

export const bookTour = async (tourId, startDate) => {
  if (!tourId || !startDate)
    return Alert("error", "Please provide a startDate");
  try {
    const session = await get_fetchAPI(
      `bookings/checkout-session/${tourId}/${startDate}`
    );
    await stripe.redirectToCheckout({
      sessionId: session.session.id,
    });
  } catch (error) {
    return Alert("error", error.message);
  }
};
