// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6te1nUmq8nvmoPErxxW7DuqG8ifPtBrM",
  authDomain: "onlinemenu-d5c62.firebaseapp.com",
  projectId: "onlinemenu-d5c62",
  storageBucket: "onlinemenu-d5c62.appspot.com",
  messagingSenderId: "28005271571",
  appId: "1:28005271571:web:58cd61309054de45d417e6",
  measurementId: "G-5FQJD5J9D1"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL};