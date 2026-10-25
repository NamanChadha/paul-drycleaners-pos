import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
export const firebaseApp = firebaseEnabled ? initializeApp(firebaseConfig) : undefined
export const auth = firebaseApp ? getAuth(firebaseApp) : undefined
export const db = firebaseApp ? getFirestore(firebaseApp) : undefined
export const storage = firebaseApp ? getStorage(firebaseApp) : undefined

if (db) enableIndexedDbPersistence(db).catch(() => undefined)
