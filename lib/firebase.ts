import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAfOa-8i3pOxTd82j9yRhrQYDxkWu0AwP8",
  authDomain: "safespace-d74dc.firebaseapp.com",
  databaseURL: "https://safespace-d74dc-default-rtdb.firebaseio.com",
  projectId: "safespace-d74dc",
  storageBucket: "safespace-d74dc.firebasestorage.app",
  messagingSenderId: "705914470184",
  appId: "1:705914470184:web:d7571472c64dc6ee0e5a1d",
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  app = (window as any).__firebaseApp;
}

export const auth = getAuth(app);
export const database = getDatabase(app);
