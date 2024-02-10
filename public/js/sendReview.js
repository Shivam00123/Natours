import { post_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const sendReview = async (review, rating) => {
  if (!review || !rating)
    return Alert("error", "Please provide a review with rating...");
  const urlParams = new URLSearchParams(window.location.search);
  const tourId = urlParams.get("tourId");
  if (!tourId) return Alert("error", "Unable to find a tour");
  const response = await post_fetchAPI(`tours/${tourId}/reviews`, {
    review,
    rating,
  });
  if (response.status === "success") {
    Alert("success", "Review posted successfully, Thank you for your review");
    location.assign("/");
  } else {
    if (response.message.startsWith("Duplicate")) {
      Alert("error", "You already have posted the review!");
      setTimeout(() => {
        location.assign("/");
      }, 1500);
      return;
    }
    Alert("error", response.message);
  }
};
