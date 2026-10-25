import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { auth, firebaseEnabled } from '../firebase/config'

export const authAvailable = firebaseEnabled && Boolean(auth)

export function watchAuth(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null)
    return () => undefined
  }
  return onAuthStateChanged(auth, callback)
}

export async function login(email: string, password: string) {
  if (!auth) throw new Error('Firebase auth is not configured.')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logout() {
  if (auth) await signOut(auth)
}
