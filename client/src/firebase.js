// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCAzJ1wG0CmE7Okuk0-yWfkFujlpoHZqM0",
  authDomain: "pizzahouse-8a2d2.firebaseapp.com",
  projectId: "pizzahouse-8a2d2",
  storageBucket: "pizzahouse-8a2d2.appspot.com",
  messagingSenderId: "371904993937",
  appId: "1:371904993937:web:c5754c0a4ef7f0827bfd30",
  measurementId: "G-LREMKSFXVW"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL};



