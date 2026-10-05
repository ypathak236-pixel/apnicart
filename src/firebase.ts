import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBu2lrTWanajkmdBiXmVkdGyJmKJiftMTg",
  authDomain: 'apnicart-9ea2a.firebaseapp.com',
  projectId: 'apnicart-9ea2a',
  storageBucket: 'apnicart-9ea2a.firebasestorage.app',
  messagingSenderId: '104682467900',
  appId: "AIzaSyBu2lrTWanajkmdBiXmVkdGyJmKJiftMTg",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
