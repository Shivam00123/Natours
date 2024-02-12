import { get_fetchAPI, post_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const loginUser = async (email, password) => {
  const response = await post_fetchAPI("users/signin", { email, password });
  if (response.status === "success") {
    Alert("success", `Welcome back ${response.data.users.name}`);
    window.setTimeout(() => {
      location.assign("/");
    }, 1500);
  } else if (response.status === "pending") {
    Alert("success", "Your OTP is pending, Please verify your OTP.");
    window.setTimeout(() => {
      location.assign(`/verifyOTP/${response.data.users.email}`);
    }, 1500);
  } else {
    console.log("logged In");
    Alert("error", response.message);
  }
};

export const logout = async () => {
  const response = await get_fetchAPI("users/signout");
  if (response.status === "success") {
    location.assign("/signin"); // true -> reload from server not only form browser
  } else {
    Alert("error", "Something went wrong");
  }
};
