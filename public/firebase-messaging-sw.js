importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAKgMoZQ4SS0H4zjVFDOPvBQZiSTrbYtIE",
  authDomain: "dexa-techincal-test.firebaseapp.com",
  databaseURL: "https://dexa-techincal-test-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dexa-techincal-test",
  storageBucket: "dexa-techincal-test.firebasestorage.app",
  messagingSenderId: "303176131444",
  appId: "1:303176131444:web:bc979fe558c8e9e0814221",
  measurementId: "G-YD9WLPL42Z"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});