import "@babel/polyfill";
import { loginUser, logout } from "./signIn";
import { displayMap } from "./toursMap";
import { updateNameOrEmail, changePassword } from "./updateSetting";

const mapSection = document.getElementById("map");
const loginForm = document.querySelector("#login_form");
const logoutButton = document.querySelector(".nav__el--logout");
const userData_form = document.querySelector("#userData_form");
const update_password_form = document.querySelector("#update_password_form");

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
    email = email?.trim();
    name = name?.trim();
    updateNameOrEmail(name, email);
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
