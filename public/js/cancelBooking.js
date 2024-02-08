import { delete_fetchAPI } from "../../utils/fetchApi";

export const cancelBooking = async (tourId) => {
  if (!tourId) return Alert("error", "Something went wrong");
  const response = await delete_fetchAPI("bookings/cancel-booking/tourId");
  console.log({ response });
};
