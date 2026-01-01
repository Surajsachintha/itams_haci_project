import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDm7l69JF8eOH4oPpw7qodAt0GarhqGjnw",
  authDomain: "itams-e18f6.firebaseapp.com",
  projectId: "itams-e18f6",
  storageBucket: "itams-e18f6.firebasestorage.app",
  messagingSenderId: "361554520960",
  appId: "1:361554520960:web:7d943b2332991f9de46f65",
  measurementId: "G-86RDH1VFNV"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: "BMy6w0M57z26H3XTuDRyyCnM_MQ8reDZYpZ_IoXuk-uasKafsL5a8gOw3c32vlKg7PZ-eyQoOJ-higNLNP7g-AQ",
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available.');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });