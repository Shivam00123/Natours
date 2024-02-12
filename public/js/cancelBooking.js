import { delete_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const cancelBooking = async (bookingId) => {
  if (!bookingId) return Alert("error", "Something went wrong");
  const response = await delete_fetchAPI(
    `bookings/cancel-booking/${bookingId}`
  );
  if (response.status === "success") {
    Alert("success", "Booking successfully canceled!");
    return;
  }
  Alert("error", response.message);
};
