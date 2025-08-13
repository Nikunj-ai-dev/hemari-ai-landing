// auth.js
const GOOGLE_AUTHZ = "https://accounts.google.com/o/oauth2/v2/auth";
const CLIENT_ID = "<YOUR_WEB_CLIENT_ID>.apps.googleusercontent.com"; // Replace with your web OAuth client ID
const REDIRECT_URI = "https://<your-domain>/oauth2/callback";       // Must match exactly in Google Cloud Console
const SCOPES = ["openid", "email", "profile"].join(" ");              // Add extra scopes if needed

// --- Helper to encode to Base64url (RFC 4648 §5)
function base64url(uint8Arr) {
  return btoa(String.fromCharCode(...uint8Arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Create PKCE code verifier and challenge
async function createPkce() {
  const randomBytes = new Uint8Array(64);
  crypto.getRandomValues(randomBytes);
  const code_verifier = base64url(randomBytes);

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code_verifier));
  const code_challenge = base64url(new Uint8Array(digest));

  return { code_verifier, code_challenge };
}

// Start login flow
export async function startGoogleLogin() {
  const { code_verifier, code_challenge } = await createPkce();
  sessionStorage.setItem("pkce_verifier", code_verifier);

  // Optional: CSRF protection
  const state = crypto.getRandomValues(new Uint32Array(4)).join("");
  sessionStorage.setItem("oauth_state", state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    include_granted_scopes: "true",
    access_type: "offline", // Needed for refresh tokens
    state,
    code_challenge,
    code_challenge_method: "S256"
  });

  // Redirect to Google auth
  window.location.href = `${GOOGLE_AUTHZ}?${params.toString()}`;
}
