import { get_fetchAPI, post_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const loginUser = async (email, password) => {
  const response = await post_fetchAPI("users/signin", { email, password });
  Alert("success", `Welcome back ${response.data.users.name}`);
  if (response.status === "success") {
    window.setTimeout(() => {
      location.assign("/");
    }, 1500);
  } else {
    Alert("error", response.message);
  }
};

export const logout = async () => {
  const response = await get_fetchAPI("users/signout");
  if (response.status === "success") {
    location.assign("/"); // true -> reload from server not only form browser
  } else {
    Alert("error", "Something went wrong");
  }
};
