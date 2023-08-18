import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, orderBy, where, onSnapshot, getDocs, addDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDF7qUgH67VHO-b98C-UoMkx6aydxXm_rQ",
    authDomain: "hackathon2k23-fbc3f.firebaseapp.com",
    projectId: "hackathon2k23-fbc3f",
    storageBucket: "hackathon2k23-fbc3f.appspot.com",
    messagingSenderId: "122503830596",
    appId: "1:122503830596:web:b8798b29836806838ab011",

};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage();
const userProfile = document.getElementById("user-profile");

const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
        const mountainsRef = ref(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(mountainsRef, file);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                reject(error)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    })
}


const getUserData = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        let fullName = document.getElementById("fullName")
        let email = document.getElementById("email")
        if (location.pathname === "/profile.html") {
            fullName.value = docSnap.data().fullName;
            email.value = docSnap.data().email;
            if (docSnap.data().picture) {
                userProfile.src = docSnap.data().picture
            }
        } else {
            fullName.innerHTML = docSnap.data().fullName;
            email.innerHTML = docSnap.data().email;
            if (docSnap.data().picture) {
                userProfile.src = docSnap.data().picture
            }
        }
    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
    }
}

onAuthStateChanged(auth, (user) => {
    const uid = localStorage.getItem("uid")
    if (user && uid) {
        console.log(user)
        getUserData(user.uid)
        getAllUsers(user.email)
        if (location.pathname !== '/profile.html' && location.pathname !== '/chat.html') {
            location.href = "profile.html"
        }
    } else {
        if (location.pathname !== '/index.html' && location.pathname !== "/register.html") {
            location.href = "index.html"
        }
    }
});


const logoutBtn = document.getElementById("logout-btn")

logoutBtn && logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        localStorage.clear()
        location.href = "index.html"
    }).catch((error) => {
        // An error happened.
    });

})


const registerBtn = document.getElementById('register-btn');

registerBtn && registerBtn.addEventListener("click", (e) => {
    e.preventDefault()
    let fullName = document.getElementById("fullName")
    let email = document.getElementById("email")
    let password = document.getElementById("password")
    createUserWithEmailAndPassword(auth, email.value, password.value)
        .then(async (userCredential) => {
            try {
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    fullName: fullName.value,
                    email: email.value,
                    password: password.value
                });
                Swal.fire({
                    icon: 'success',
                    title: 'User register successfully',
                })
                localStorage.setItem("uid", user.uid)
                location.href = "profile.html"
            } catch (err) {
                console.log(err)
            }
        })
        .catch((error) => {
            const errorMessage = error.message;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessage,
            })
        });
})


const loginBtn = document.getElementById('login-btn');

loginBtn && loginBtn.addEventListener("click", (e) => {
    e.preventDefault()
    let email = document.getElementById("email")
    let password = document.getElementById("password")
    signInWithEmailAndPassword(auth, email.value, password.value)
        .then(async (userCredential) => {
             try {
                 Swal.fire({
                    icon: 'success',
                    title: 'User login successfully',
                })
                localStorage.setItem("uid", userCredential.user.uid)
             location.href = "profile.html"
            } catch (err) {
                console.log(err)
            }
        })
        .catch((error) => {
            const errorMessage = error.message;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessage,
            })
        });
})

const fileInput = document.getElementById("file-input");

fileInput && fileInput.addEventListener("change", () => {
    console.log(fileInput.files[0])
    userProfile.src = URL.createObjectURL(fileInput.files[0])
})

const updateProfile = document.getElementById("update-profile");

updateProfile && updateProfile.addEventListener("click", async () => {
    let uid = localStorage.getItem("uid")
    let fullName = document.getElementById("fullName")
    let email = document.getElementById("email")
    const imageUrl = await uploadFile(fileInput.files[0])
    const washingtonRef = doc(db, "users", uid);
    await updateDoc(washingtonRef, {
        fullName: fullName.value,
        email: email.value,
        picture: imageUrl
    });
    Swal.fire({
        icon: 'success',
        title: 'User updated successfully',
    })
})


const getAllUsers = async (email) => {
    console.log("email", email)
    const q = query(collection(db, "users"), orderBy("email"), where("email", "!=", email), orderBy("isActive", 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ ...doc.data(), uid: doc.id });
        });
        const chatList = document.getElementById("chat-list")
        chatList.innerHTML = ""
        for (var i = 0; i < users.length; i++) {
            const { email, fullName, picture, isActive, notifications, uid } = users[i]
            chatList.innerHTML += `
                      <li onclick="selectChat('${email}','${fullName}','${picture}','${uid}')" class="user-container list-group-item d-flex justify-content-between align-items-start">
                         <div class="ms-2 me-auto">
                             <div class="fw-bold">${fullName}</div>
                             <span class="user-email">${email}</span>
                         </div>
                         ${notifications ? `<span class="badge rounded-pill bg-danger notification-badge">
                        ${notifications}
                       </span>` : ""}
                         <div class="online-dot ${isActive ? 'green-dot' : 'red-dot'}"></div>
                     </li>`
        }
    })
}

let selectUserId;

const selectChat = (email, fullName, picture, selectedId) => {
    selectUserId = selectedId;
    let currentUserId = localStorage.getItem('uid');
    let chatID;
    if (currentUserId < selectUserId) {
        chatID = currentUserId + selectUserId;
    } else {
        chatID = selectUserId + currentUserId;
    }
    const selectedUserProfile = document.getElementById("selected-user-profile");
    const selectedfullName = document.getElementById("selectedfullName");
    const selectedEmail = document.getElementById("selectedEmail");
    selectedfullName.innerHTML = fullName;
    selectedEmail.innerHTML = email;
    if (picture !== 'undefined') {
        selectedUserProfile.src = picture;
    } else {
        selectedUserProfile.src = 'images/user.png'
    }
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.style.display = 'block';
    getAllMessages(chatID)
}


const messageInput = document.getElementById("message-input");

// messageInput.addEventListener("keydown", async (e) => {
//     if (e.keyCode === 13) {
//         let currentUserId = localStorage.getItem('uid');
//         let chatID;
//         if (currentUserId < selectUserId) {
//             chatID = currentUserId + selectUserId;
//         } else {
//             chatID = selectUserId + currentUserId;
//         }
//         let message = messageInput.value;
//         messageInput.value = "";
//         try {

//             const docRef = await addDoc(collection(db, "messages"), {
//                 message: message,
//                 chatID: chatID,
//                 timestamp: serverTimestamp(),
//                 sender: currentUserId,
//                 receiver: selectUserId,
//                 seen: false
//             });
//             console.log("selectUserId", currentUserId)
//             const userRef = doc(db, "users", currentUserId);
//             await updateDoc(userRef, {
//                 notifications: increment(1)
//             });
//             messageInput.value = ""
//             console.log("message sent")
//         } catch (err) {
//             console.log(err)
//         }
//     }
// })



const getAllMessages = (chatID) => {
    const q = query(collection(db, "messages"), orderBy("timestamp", 'desc'), where("chatID", "==", chatID));
    const chatBox = document.getElementById("chat-box")
    let currentUserId = localStorage.getItem('uid');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push(doc.data());
        });
        console.log("messages", messages)
        chatBox.innerHTML = "";
        for (var i = 0; i < messages.length; i++) {
            let time = messages[i].timestamp ? moment(messages[i].timestamp.toDate()).fromNow() : moment().fromNow();
            if (currentUserId === messages[i].sender) {
                chatBox.innerHTML += `<div class="message-box right-message mb-2">
                                       ${messages[i].message}
                                       <br />
                                       <span>${time}</span>
                                      </div>
                `
            } else {
                chatBox.innerHTML += `
                <div class="message-box left-message mb-2">
                ${messages[i].message}
                <br />
                <span>${time}</span>
                 </div>`
            }

            console.log("messages", messages);
        }
    });
}



const setActiveStatus = async (status) => {
    let currentUserId = localStorage.getItem('uid');
    const userRef = doc(db, "users", currentUserId);
    await updateDoc(userRef, {
        isActive: status
    });
}

window.addEventListener("beforeunload", () => {
    setActiveStatus(false)
})

window.addEventListener("focus", () => {
    setActiveStatus(true)
})


// ja6VZkohq3QfTRHDjh7RzNAQmHJ3k4TywH1BTVMWGHz7jTIYUuHV5Y83

// ja6VZkohq3QfTRHDjh7RzNAQmHJ3k4TywH1BTVMWGHz7jTIYUuHV5Y83

window.selectChat = selectChat;