import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth,GoogleAuthProvider,signInWithPopup, sendPasswordResetEmail, createUserWithEmailAndPassword,signInWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore,collection, addDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyDF7qUgH67VHO-b98C-UoMkx6aydxXm_rQ",
  authDomain: "hackathon2k23-fbc3f.firebaseapp.com",
  projectId: "hackathon2k23-fbc3f",
  storageBucket: "hackathon2k23-fbc3f.appspot.com",
  messagingSenderId: "122503830596",
  appId: "1:122503830596:web:b8798b29836806838ab011"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//   Initialize auth
const auth = getAuth(app);

// Initializing FireStore

const db = getFirestore(app);


// Initilaing provider for google 
const provider = new GoogleAuthProvider();






export {app,auth,db,collection,provider, addDoc,createUserWithEmailAndPassword,signInWithEmailAndPassword, sendPasswordResetEmail,signInWithPopup,GoogleAuthProvider,}