import { post_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const forgotPassword = async (email) => {
  if (!email) return Alert("error", "Please provide email!");
  const response = await post_fetchAPI("users/forgotPassword", { email });
  if (response.status !== "success") {
    Alert("error", response.message);
    return false;
  }
  Alert("success", "Reset Token has been sent on your Email!");
};
