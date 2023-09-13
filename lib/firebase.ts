import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCpws1suesuTF_csE3Nwy-QydkajyE5biM",
    authDomain: "calvin-art.firebaseapp.com",
    databaseURL: "https://calvin-art-default-rtdb.firebaseio.com",
    projectId: "calvin-art",
    storageBucket: "calvin-art.appspot.com",
    messagingSenderId: "96800809207",
    appId: "1:96800809207:web:96238b8bceb8b50068f3f2",
    measurementId: "G-5H2Z08X4NR"
  };

export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const db = getFirestore(app);