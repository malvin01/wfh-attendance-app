import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

try {
  messaging = getMessaging(app);
} catch (error) {
  console.error("Firebase Messaging not supported:", error);
}

export { messaging };

function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  return `${browser}/${os}`;
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (!messaging) {
      return null;
    }

    if (!('Notification' in window)) {
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return null;
    }

    const vapidKey = import.meta.env.VITE_VAPID_KEY;

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      )
    });

    return token;
  } catch (error) {
    return null;
  }
}

export function setupForegroundListener(callback: (payload: any) => void) {
  if (!messaging) {
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    callback(payload);
  });

  return unsubscribe;
}

export async function setupNotifications(apiInstance: any): Promise<boolean> {
  try {
    const token = await requestNotificationPermission();

    if (!token) {
      return false;
    }

    const deviceInfo = getDeviceInfo();

    localStorage.setItem('fcmToken', token);

    await apiInstance.post('/notifications/register-token', {
      token,
      deviceType: deviceInfo
    });

    return true;

  } catch (error) {
    return false;
  }
}