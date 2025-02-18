import { getApps, initializeApp } from "firebase/app"
import { getAuth, signInWithCustomToken, setPersistence, indexedDBLocalPersistence } from "firebase/auth/web-extension"
import { getFirestore } from "firebase/firestore"

export const clientCredentials = {
  apiKey: process.env.PLASMO_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PLASMO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.PLASMO_PUBLIC_FIREBASE_MEASUREMENT_ID
}

let firebase_app = getApps().length ? getApps()[0] : initializeApp(clientCredentials)

export const auth = getAuth(firebase_app)
export const db = getFirestore(firebase_app)

setPersistence(auth, indexedDBLocalPersistence);

// Function to authenticate with Firebase using custom token
export const authenticateWithFirebase = async (uid: string) => {
  try {
    // Exchange UID for a custom token
    const response = await fetch('https://raptor3-web.vercel.app/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get custom token')
    }

    const { customToken } = await response.json()
    if (!customToken) {
      throw new Error('No custom token received')
    }
    
    // Sign in with the custom token
    return signInWithCustomToken(auth, customToken)
  } catch (error) {
    console.error("Authentication error:", error)
    throw error
  }
}



export default firebase_app