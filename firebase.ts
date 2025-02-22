import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove } from "firebase/database";

// Define the User interface for your users in Firebase
export interface User {
  username: string;
  password: string;
}

// Define the Listener interface for the structure of the listener data
export interface Listener {
  course: string;
  day: string;
  minTime: string;
  maxTime: string;
  players: string;
}

// Your Firebase configuration (get this from your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyBhHdendZZZuez68LA5uzA4Wz9jh4Uk080",
  authDomain: "teetimes-c8dc1.firebaseapp.com",
  databaseURL: "https://teetimes-c8dc1-default-rtdb.firebaseio.com",
  projectId: "teetimes-c8dc1",
  storageBucket: "teetimes-c8dc1.firebasestorage.app",
  messagingSenderId: "195058550229",
  appId: "1:195058550229:web:712957d6208329296ba95c",
  measurementId: "G-BL4Q36ZQ1H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database
const db = getDatabase(app);

// ================================
// Functions for Listener Data
// ================================

// Helper function to write data to the Firebase Realtime Database
export const writeListenerData = (listenerId: string, listenerData: Listener) => {
  const listenerRef = ref(db, 'listeners/' + listenerId);
  set(listenerRef, listenerData);
};

// Helper function to get data from Firebase
export const readListenerData = async (): Promise<Record<string, Listener> | null> => {
  const dbRef = ref(db, 'listeners/');
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return null;
  }
};

// Function to delete a listener by its ID
export const deleteListenerData = (listenerId: string) => {
  const listenerRef = ref(db, 'listeners/' + listenerId);
  remove(listenerRef); // Remove the listener from Firebase
};

// ================================
// Functions for User Data
// ================================

// Helper function to get users from Firebase, typed as Record<string, User>
export const getUsersFromDatabase = async (): Promise<Record<string, User> | null> => {
  const usersSnapshot = await get(ref(db, "users"));
  return usersSnapshot.val(); // Returns null if no users found
};

