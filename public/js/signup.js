import { post_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const registerUser = async (name, email, password, confirmPassword) => {
  if (!name || !email || !password || !confirmPassword)
    return Alert("error", "All fields are mandatory to fill.");
  if (password !== confirmPassword)
    return Alert("error", "Password does not match");

  const response = await post_fetchAPI("users/signup", {
    name,
    email,
    password,
    confirmPassword,
  });
  if (response.status === "success") {
    location.assign(`/verifyOTP/${response.data.users.email}`);
  } else {
    Alert("error", response.message);
  }
};
