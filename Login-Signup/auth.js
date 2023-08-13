import {
  auth,
  app,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,collection, addDoc,
} from "./firebase.js";

// Signup creating a user

const signBtn = document.getElementById("signUpBtn");

signBtn.addEventListener("click", () => {
  const email = document.getElementById("email");
  const pass = document.getElementById("password");
  const userName = document.getElementById("userName");

// reseting borders here

email.classList.remove("err-border");
userName.classList.remove("err-border");
pass.classList.remove("err-border");

// resetting border after getting input something!
email.addEventListener("input", () => {
  email.classList.remove("err-border");
});

userName.addEventListener("input", () => {
  userName.classList.remove("err-border");
});

pass.addEventListener("input", () => {
  pass.classList.remove("err-border");
});

  if (!email.value || !pass.value || !userName.value) {
    email.classList.add("err-border");
    userName.classList.add("err-border");
    pass.classList.add("err-border");

    // validation
    Swal.fire({
      title: "Fields Cannot Be Empty",
      text: "Please fill out all required fields.",
      icon: "error",
      confirmButtonText: "OK",
    });

    return;
  }
// create new user function starts here...
  createUserWithEmailAndPassword(auth, email.value, pass.value)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);


      // storing user details in firestore... (like username here.)
      const docRef =  addDoc(collection(db, "users"), {
        username : userName.value,
        email: email.value,
      });
    
      Swal.fire({
        title: "Account Created!",
        text: "Please login to continue.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // change the file location #000
        window.location.href = "index.html";
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage, "code" + errorCode);

      if (errorCode == "auth/email-already-in-use") {
        console.log("email use mein hai");
        const emailMsg = document.getElementById("err-div");
        console.log(emailMsg);

        emailMsg.classList.add("show");
        emailMsg.innerHTML = "Email is already in use! Try again.";


        setTimeout(()=>{
          emailMsg.classList.remove("show");

         
        },5000);
      }
    });
});
