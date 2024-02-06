import { post_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const verifyOTP = async (OTP) => {
  if (!OTP) return Alert("Please provide OTP");
  const response = await post_fetchAPI("users/verify-user-otp", { OTP });
  console.log({ response });
  if (response.status === "success") {
    location.assign("/");
  } else {
    Alert("error", response.message);
  }
};
