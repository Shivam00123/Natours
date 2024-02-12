import { post_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const resendOTP = async () => {
  const response = await post_fetchAPI("users/resendOTP");

  if (response.status !== "success") {
    Alert("error", response.message);
    return { status: "error" };
  }
  return { status: "success" };
};
