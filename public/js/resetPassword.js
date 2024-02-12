import { patch_fetchAPI, post_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const resetPassword = async (password, confirmPassword) => {
  const url = window.location.href;
  const match = url.match(/\/resetPassword\/([^\/]+)$/);
  if (!match) return Alert("error", "No token found to reset your password");
  const id = match[1];
  const response = await patch_fetchAPI(`users/resetPassword/${id}`, {
    password,
    confirmPassword,
  });
  if (response.status === "success") {
    Alert(
      "success",
      "Your Password has successfully reset, Please login to continue"
    );
  } else {
    Alert("error", `${response.message}`);
  }
};
