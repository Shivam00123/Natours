import "@babel/polyfill";
import { loginUser, logout } from "./signIn";
import { displayMap } from "./toursMap";
import { updateNameOrEmail, changePassword } from "./updateSetting";
import { registerUser } from "./signup";
import { verifyOTP } from "./verifyOTP";

const mapSection = document.getElementById("map");
const loginForm = document.querySelector("#login_form");
const signup_form = document.querySelector("#signup_form");
const logoutButton = document.querySelector(".nav__el--logout");
const userData_form = document.querySelector("#userData_form");
const update_password_form = document.querySelector("#update_password_form");
const otp_form = document.querySelector("#otp_form");

if (mapSection) {
  const locations = JSON.parse(mapSection.dataset.locations);

  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    loginUser(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

if (userData_form) {
  userData_form.addEventListener("submit", (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let name = document.getElementById("name").value;
    let photo = document.getElementById("photo");
    console.log(photo.files);
    const form = new FormData();
    form.append("name", name);
    form.append("email", email);
    form.append("photo", document.getElementById("photo").files[0]);
    updateNameOrEmail(form);
  });
}

if (update_password_form) {
  update_password_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector("#update_password_btn").textContent = "Updating...";
    let passwordCurrent = document.getElementById("password-current").value;
    let password = document.getElementById("password").value;
    let passwordConfirm = document.getElementById("password-confirm").value;
    await changePassword(passwordCurrent, password, passwordConfirm);
    document.querySelector("#update_password_btn").textContent =
      "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}

if (signup_form) {
  signup_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector("#register").textContent = "Registering...";
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm_password");
    await registerUser(
      name.value,
      email.value,
      password.value,
      confirmPassword.value
    );
    name.value = "";
    email.value = "";
    password.value = "";
    confirmPassword.value = "";
    document.querySelector("#register").textContent = "Register";
  });
}

if (otp_form) {
  otp_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const candidate_otp = document.getElementById("otp");
    const verify_btn = document.getElementById("verify");
    verify_btn.textContent = "Verifying...";
    await verifyOTP(candidate_otp.value);
    candidate_otp.value = "";
    verify_btn.textContent = "Verify";
  });
}
