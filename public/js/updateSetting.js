import { patch_fetchAPI, post_fetchAPI } from "../../utils/fetchApi";
import { Alert } from "./alert";

export const updateNameOrEmail = async (data) => {
  const response = await axios({
    method: "PATCH",
    url: "/api/v1/users/updateMe",
    data,
  });

  if (response.data.status === "success") {
    Alert("success", "Settings Updated!");
    window.setTimeout(() => {
      location.reload(true);
    }, 1600);
  } else {
    Alert("error", response.data.message);
  }
};

export const changePassword = async (
  currentPassword,
  password,
  confirmPassword
) => {
  if (!currentPassword || !password || !confirmPassword) {
    Alert("error", "All fields are mandatory to change the password");
    return;
  }
  const response = await post_fetchAPI("users/updatePassword", {
    currentPassword,
    password,
    confirmPassword,
  });
  if (response.status === "success") {
    Alert("success", "Password Updated Successfully!");
  } else {
    Alert("error", response.message);
  }
  return;
};
