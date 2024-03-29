import "@babel/polyfill";
import { loginUser, logout } from "./signIn";
import { displayMap } from "./toursMap";
import { updateNameOrEmail, changePassword } from "./updateSetting";
import { registerUser } from "./signup";
import { verifyOTP } from "./verifyOTP";
import { resendOTP } from "./resendOTP";
import { forgotPassword } from "./forgotPassword";
import { Alert } from "./alert";
import { resetPassword } from "./resetPassword";
import { bookTour } from "./bookTour";
import { cancelBooking } from "./cancelBooking";
import { sendReview } from "./sendReview";

const mapSection = document.getElementById("map");
const loginForm = document.querySelector("#login_form");
const signup_form = document.querySelector("#signup_form");
const logoutButton = document.querySelector(".nav__el--logout");
const userData_form = document.querySelector("#userData_form");
const update_password_form = document.querySelector("#update_password_form");
const otp_form = document.querySelector("#otp_form");
const forgot_password_form = document.querySelector("#forgot_password_form");
const reset_password_form = document.querySelector("#reset_password_form");
const book_tour = document.getElementById("book_tour");
const menu_list = document.getElementById("menu_list");
const search_tour = document.getElementById("search_tour");
const cancel_booking = document.getElementById("cancel_booking");
const add_review = document.getElementById("add_review");
const review_form = document.querySelector("#review_form");
const date_picker_form = document.querySelector("#date_picker_form");

// Map-section
if (mapSection) {
  const locations = JSON.parse(mapSection.dataset.locations);

  displayMap(locations);
}

// Login-section

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    loginUser(email, password);
  });
  const forgot_password_btn = document.getElementById("forgot_password_btn");
  forgot_password_btn.addEventListener("click", async (e) => {
    location.assign("/forgot-password");
  });
}

// Logout-section

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

// Update-User-Data-section
if (userData_form) {
  userData_form.addEventListener("submit", (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let name = document.getElementById("name").value;
    let photo = document.getElementById("photo");
    const form = new FormData();
    form.append("name", name);
    form.append("email", email);
    form.append("photo", document.getElementById("photo").files[0]);
    updateNameOrEmail(form);
  });
  let img = document.getElementById("user_profile");
  let user_profile_input = document.getElementById("photo");
  user_profile_input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.addEventListener("loadend", () => {
        img.src = fileReader.result;
      });
    }
  });
}

// Update-Password-section

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

// Signup-section

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

// OTP-section

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

  const resendOTP_btn = document.getElementById("Resend_OTP");
  resendOTP_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const verify_btn = document.getElementById("verify");
    const text = document.getElementById("verify_otp_text");
    verify_btn.textContent = "sending OTP...";
    const status = await resendOTP();
    if (status.status === "success") {
      text.textContent = "New OTP has sent on your email address";
      Alert("success", "New OTP has been sent on your email, Please check!");
    }
    verify_btn.textContent = "Verify";
  });
}

//Forgot-Password-section

if (forgot_password_form) {
  forgot_password_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email");
    const send_btn = document.getElementById("send");
    send_btn.textContent = "Sending mail...";
    await forgotPassword(email.value);
    send_btn.textContent = "Send";
  });
}

if (reset_password_form) {
  reset_password_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm_password");
    const reset_btn = document.getElementById("reset_btn");
    reset_btn.textContent = "Please wait...";
    await resetPassword(password.value, confirmPassword.value);
    reset_btn.textContent = "Reset";
  });
}

if (cancel_booking) {
  cancel_booking.addEventListener("click", async (e) => {
    e.preventDefault();
    e.target.textContent = "Wait...";
    const bookingId = e.target.dataset.tourId;
    await cancelBooking(bookingId);
    location.assign("/");
  });
}

if (menu_list) {
  document.getElementById("component1").style.display = "block";
  document.querySelectorAll(".side-nav--")[0].classList.add("side-nav--active");
  menu_list.addEventListener("click", function (e) {
    e.preventDefault();
    let listItem = e.target.closest("li");
    let comp = listItem.getAttribute("data-target");
    if (listItem.classList.contains("side-nav--")) {
      // Remove "active" class from all menu items
      let menuItems = document.querySelectorAll(".side-nav--active");
      menuItems.forEach(function (item) {
        item.classList.remove("side-nav--active");
      });

      // Add "active" class to the clicked menu item
      listItem.classList.add("side-nav--active");
    }
    const components = document.querySelectorAll(".user-view__content");
    components.forEach(function (component) {
      component.style.display = "none";
    });
    document.getElementById(comp).style.display = "block";
  });
}

if (add_review) {
  add_review.addEventListener("click", async (e) => {
    e.preventDefault();
    const tourId = e.target.dataset.tourId;
    location.assign(`/review?tourId=${tourId}`);
    // location.assign("/tours/:tourId/reviews");
  });
}

if (review_form) {
  let starCount = 5;
  const review_star = document.getElementById("review_star");
  review_star.addEventListener("click", (e) => {
    e.preventDefault();
    starCount = e.target.dataset.index * 1;

    const stars = document.querySelectorAll("#review_star_star");
    stars.forEach((star) => star.classList.add("reviews__star--inactive"));
    for (let i = 0; i < starCount; i++) {
      stars[i].classList.remove("reviews__star--inactive");
      stars[i].classList.add("reviews__star--active");
    }
  });
  document
    .getElementById("post_review")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const review = document.getElementById("review");
      await sendReview(review.value, starCount);
    });
}
if (date_picker_form) {
  date_picker_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const startDate_value = document.getElementById("startDate_value");
    const submit_startDate = document.getElementById("submit_startDate");
    const tourId = startDate_value.dataset.id;
    submit_startDate.textContent = "Processing...";
    await bookTour(tourId, startDate_value.value);
    submit_startDate.textContent = "Submit";
  });
}

if (book_tour) {
  book_tour.addEventListener("click", async (e) => {
    e.preventDefault();
    const tourId = e.target.dataset.tourId;
    if (!tourId) return Alert("error", "Cannot book your tour right now");
    location.assign(`/selectStartDate/${tourId}`);
  });
}
