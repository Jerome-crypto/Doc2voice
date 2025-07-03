import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGsiHpFv4yYOLvyXUYviiJzm_0eaQJjx8",
  authDomain: "doc2audio.firebaseapp.com",
  projectId: "doc2audio",
  appId: "1:1234567890:web:0987654321abcdef",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
