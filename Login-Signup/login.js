import {
  auth,
  db,
  app,
  collection,
  addDoc,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  provider,
  RecaptchaVerifier,

} from "./firebase.js";

// login the existing users

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);
      Swal.fire({
        title: "Logged In successfully!",
        text: "Please Wait.",
        icon: "success",
        confirmButtonText: "Enter",
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
    });
});

// Forfot password functionality

const forgotPass = document.getElementById("forgotPass");

forgotPass.addEventListener("click", (e) => {
  e.preventDefault();

  swal.fire({
    title: "Forgot Password",
    html: `  <form id="resetForm">
        <label for="email">
        <i class="fa-solid fa-envelope resetEmailIcon" style="color: #259af2;"></i>
        <input type="email" id="resetEmail" class="reset-email" placeholder="Enter your email address">
        </label>
        <button type="submit" class="resetBtn">Reset Password</button>
      </form>`,
    showCancelButton: true,
    showConfirmButton: false,
  });

  const resetForm = document.getElementById("resetForm");
  resetForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const resetEmail = document.getElementById("resetEmail").value;

    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        swal.fire(
          "Email sent",
          "Check your email for reset instructions.",
          "success"
        );
      })
      .catch((err) => {
        const errorMessage = err.message;
        console.log(errorMessage);
        swal.fire("Error", errorMessage, "error");
      });
  });
});

// other login options

// google

const googleBtn = document.getElementById("googleLogin");
googleBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      const userEmail = user.email;
      const username = user.displayName;
      const profileUrl = user.photoURL;
      // extracted email username and profile image url;
      console.log(
        `Email=> ${userEmail} displayName=> ${username}, Image=> ${profileUrl}`
      );

      // storing user details in firestore... (like username here.)
      const docRef = addDoc(collection(db, "users"), {
        username: username,
        email: userEmail,
      });
      console.log("User signed in with Google:", user);

      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // ...

      console.log("====================================");
      console.log(errorMessage);
      console.log("====================================");
    });
  console.log("done scene");
});


// login via SMS/phone

const phoneBtn = document.getElementById("phoneBtn");
phoneBtn.addEventListener("click",()=>{
// custom pop-up form
   const popup= swal.fire({
    title: "Login via Phone",
    html: `  <form id="loginWithPhone">
        <label for="phone" class="phone-label">
        <i class="fa-solid fa-phone resetEmailIcon" style="color: #259af2;"></i>
        <input type="number" id="phoneNumber" class="theme-input" placeholder="Enter your Phone Number" requried>
        </label>
        <button id="sendBtn" class="theme-btn">Send Code</button>
        <label for="Code" class="code-label">
        <i class="fa-solid fa-phone resetEmailIcon" style="color: #259af2;"></i>
        <input type="number" id="verificationCode" class="reset-email" placeholder="Enter verification code ">
        </label>
        <button type="submit" class="resetBtn">Send Code</button>
      </form>`,
    showCancelButton: true,
    showConfirmButton: false,
  });

  const sendBtn = document.getElementById("sendBtn");
  sendBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    const phoneNumber = document.getElementById("phoneNumber");
    if(phoneNumber.value ===""){
    phoneNumber.classList.add("err-border");
// removing added error class after 5 seconds
          setTimeout(()=>{
            phoneNumber.classList.remove("err-border");
          },5000)
}else{

    console.log(phoneNumber.value);

    // use phone function here after getting number from user if its wrong firebase will handle it.

}

  });
})
