

// -------------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9bTCCt8IsYUh664agg5To4wGzugS4eWk",
  authDomain: "hackathon2023-cdf55.firebaseapp.com",
  projectId: "hackathon2023-cdf55",
  storageBucket: "hackathon2023-cdf55.appspot.com",
  messagingSenderId: "341882105755",
  appId: "1:341882105755:web:da94799c8da06087b4bb3e"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage();

// register user

const signUpBtn = document.getElementById("signUp");
signUpBtn &&
  signUpBtn.addEventListener("click", () => {
    const userName = document.getElementById("userName");
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPass");

    createUserWithEmailAndPassword(auth, email.value, password.value)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        await setDoc(doc(db, "users", user.uid), {
          name: userName.value,
          email: email.value,
          password: password.value,
        });
        localStorage.setItem("uid", user.uid);
        location.href = "./index.html";
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorMessage);
      });

    // console.log(`${userName.value} email => ${email.value}, pass=> ${password.value}`);
  });

// login users authentication

const loginbtn = document.getElementById("loginBtn");
loginbtn &&
  loginbtn.addEventListener("click", () => {
    const email = document.getElementById("email");
    const pass = document.getElementById("password");

    signInWithEmailAndPassword(auth, email.value, pass.value)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);

        try {
          await Swal.fire({
            icon: "success",
            title: "user login successfully",
          });
          localStorage.setItem("uid", user.uid);
          window.location.href = "./chat.html";
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
      });

    // console.log(`email=> ${email.value}, pass=>${pass.value}`);
  });

// state change:

onAuthStateChanged(auth, (user) => {
  const uid = localStorage.getItem("uid");
  if (user && uid) {
    console.log(user);
    getUserData(user.uid);
    getAllUsers(user.email);
    if (location.pathname !== "/chat.html") {
      location.href = "chat.html";
    }
  } else {
    if (
      location.pathname !== "/index.html" &&
      location.pathname !== "/Signup.html"
    ) {
      location.href = "index.html";
    }
  }
});

// logout btn

const logoutBtn = document.getElementById("logout-btn");

logoutBtn &&
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        localStorage.clear();
        location.href = "index.html";
      })
      .catch((error) => {
        // An error happened.
      });
  });

// updating image and profiles

const fileInput = document.getElementById("file-input");
const userProfile = document.getElementById("user-profile");
const homeProfile = document.getElementById("homeProfile");
fileInput &&
  fileInput.addEventListener("change", () => {
    console.log(fileInput.files[0]);
    userProfile.src = URL.createObjectURL(fileInput.files[0]);
    homeProfile.src = URL.createObjectURL(fileInput.files[0]);
  });

const updateProfile = document.getElementById("update-profile");

updateProfile &&
  updateProfile.addEventListener("click", async () => {
    let uid = localStorage.getItem("uid");
    let name = document.getElementById("userNameUdated");
    let email = document.getElementById("email");
    const imageUrl = await uploadFile(fileInput.files[0]);
    const washingtonRef = doc(db, "users", uid);
    console.log("====================================");
    console.log(name.value, email.value);
    console.log("====================================");
    await updateDoc(washingtonRef, {
      name: name.value,
      email: email.value,
      picture: imageUrl,
    });
    Swal.fire({
      icon: "success",
      title: "User updated successfully",
    });
  });

// uploading image function to storage

const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const mountainsRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(mountainsRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

// getting login user data

const getUserData = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    let userProfile = document.getElementById("user-profile");
    let fullName = document.getElementById("userNameUdated");
    let username = document.getElementById("fullName");
    let userProfileMain = document.getElementById("homeProfile");
    let email = document.getElementById("email");
    if (location.pathname === "/chat.html") {
      fullName.value = docSnap.data().name;
      email.value = docSnap.data().email;
      username.innerHTML = docSnap.data().name;
      if (docSnap.data().picture) {
        userProfile.src = docSnap.data().picture;
        userProfileMain.src = docSnap.data().picture;
      }
    } else {
      console.log("No such document!");
    }
  }
};

// getting all registered user data

const getAllUsers = async (email) => {
  console.log("email=>", email);
  const q = query(
    collection(db, "users"),
    where("email", "!=", email), // Filtering users with different email
    orderBy("email")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const users = [];
    querySnapshot.forEach((doc) => {
      // Iterating over the querySnapshot
      users.push({ ...doc.data(), uid: doc.id });
    });
    console.log("====================================");
    console.log(users);
    console.log("====================================");

    const chatList = document.getElementById("chatList");
    // console.log(chatList);
    chatList.innerHTML = "";
    for (var i = 0; i < users.length; i++) {
      const { email, name, picture, uid } = users[i];
      chatList.innerHTML += ` 
            <ul>
              <li onclick="selectChat('${name}','${picture}','${uid}')">
                <img src="${picture}" alt="" />
                <div class="detail-wrapper">
                  <p>${name}</p>
                  <p>${email}</p>
                </div>
                <div class="notification"><p>10</p></div>
                <span class="chatTime">12:56 AM</span>
              </li>
            </ul>`;
    }
  });

  // Remember to unsubscribe when you're done with the listener (if needed)
  // unsubscribe();
};

// slecting chat here

let selectUserId;

const selectChat = (name, picture, selectedId) => {
  selectUserId = selectedId;
  let currentUserId = localStorage.getItem("uid");

  let chatID;
  if (currentUserId < selectUserId) {
    chatID = currentUserId + selectUserId;
  } else {
    chatID = selectUserId + currentUserId;
  }

  const selectedUserName = document.getElementById("selectedUser");
  const selectedUserProfile = document.getElementById("selectedUserPic");

  selectedUserName.innerHTML = name;
  if (picture !== "undefined") {
    selectedUserProfile.src = picture;
  } else {
    selectedUserProfile.src = "./images/icons/profile-user.png";
  }

  getAllMessages(chatID);
};

// sending messages to firebase

const messageInput = document.getElementById("message-input");

messageInput&& messageInput.addEventListener("keydown", async (e) => {
  if (e.keyCode === 13) {
    let currentUserId = localStorage.getItem("uid");
    let chatID;
    if (currentUserId < selectUserId) {
      chatID = currentUserId + selectUserId;
    } else {
      chatID = selectUserId + currentUserId;
    }

    let message = messageInput.value;
    messageInput.value = "";
    try {
      const docRef = await addDoc(collection(db, "messages"), {
        message: message,
        chatID: chatID,
        timestamp: serverTimestamp(),
        sender: currentUserId,
        reciever: selectUserId,
        seen: false,
      });
    } catch (err) {
      console.log(err);
    }
  }
});

// getting messages from firebase

const getAllMessages = (chatID) => {
  const q = query(
    collection(db, "messages"),
    orderBy("timestamp", "desc"),
    where("chatID", "==", chatID)
  );
  const chatBox = document.getElementById("mesage-box");
  let currentUserId = localStorage.getItem("uid");
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push(doc.data());
    });
    console.log("message=>", messages);
    chatBox.innerHTML = "";
    for (var i = 0; i < messages.length; i++) {
      let time = messages[i].timestamp
        ? moment(messages[i].timestamp.toDate()).fromNow()
        : moment().fromNow();
      if (currentUserId === messages[i].sender) {
        chatBox.innerHTML += `
          <div class="sender-message">${messages[i].message}<br/><span>${time} <i class="fas fa-edit onclick="editChat('${chatID}')"></i>
          </span></div>
          `;
      } else {
        chatBox.innerHTML += `
        <div class="receiver-message">${messages[i].message}<br/><span>${time}</span></div>

        `;
      }
      console.log("====================================");
      console.log("messages=>", messages);
      console.log("====================================");
    }
  });
};

const editChat = async (chatID) => {
  try {
    await updateDoc(doc(db, "messages", chatID), {
      message: "updat kerdia",
    });
  } catch (err) {
    console.log(err);
  }
};

window.selectChat = selectChat;
