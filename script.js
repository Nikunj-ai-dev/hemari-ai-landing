// script.js
import { startGoogleLogin } from "./auth.js";

// Attach event listeners once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Example: all buttons that should trigger Google login have this class
  const loginButtons = document.querySelectorAll(".google-login-btn");

  loginButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      startGoogleLogin();
    });
  });
});
