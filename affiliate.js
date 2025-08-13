// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCEHRpedPmw-_33xIFvsjenEeGaJ1GPORs",
  authDomain: "hemari.firebaseapp.com",
  projectId: "hemari",
  storageBucket: "hemari.firebasestorage.app",
  messagingSenderId: "1050131542351",
  appId: "1:1050131542351:web:629e977e097ea4d291953a"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Get referral code from URL (if any)
function getRefFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ref") || null;
}

const referrerCode = getRefFromUrl();

document.getElementById("googleSignInBtn").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(async (result) => {
    const user = result.user;
    const userRef = db.collection("affiliates").doc(user.uid);
    const docSnap = await userRef.get();

    if (!docSnap.exists) {
      // New signup
      await userRef.set({
        email: user.email,
        referralCode: user.uid,
        referrals: 0,
        joinedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // If signed up with a referral code, increment referrer's count
      if (referrerCode && referrerCode !== user.uid) {
        const referrerQuery = await db.collection("affiliates")
          .where("referralCode", "==", referrerCode)
          .get();

        if (!referrerQuery.empty) {
          const referrerDoc = referrerQuery.docs[0];
          await db.collection("affiliates").doc(referrerDoc.id).update({
            referrals: firebase.firestore.FieldValue.increment(1)
          });
        }
      }
    }

    // Fetch updated affiliate data
    const updatedDoc = await userRef.get();
    const data = updatedDoc.data();

    document.getElementById("referralCode").innerText = data.referralCode;
    document.getElementById("userCount").innerText = data.referrals;
    document.getElementById("affiliateInfo").style.display = "block";
  }).catch(err => {
    console.error(err);
    alert("Error signing in with Google");
  });
});
