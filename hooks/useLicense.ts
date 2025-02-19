import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { getDatabase, ref, get } from "firebase/database"
import { db } from "~firebase/firebaseClient"

export const useLicense = (uid: string | undefined) => {
  const [licenseStatus, setLicenseStatus] = useState<{
    license: boolean
    licenseStatus: string
  }>({ license: false, licenseStatus: "loading" })

  useEffect(() => {
    const checkLicense = async () => {
      if (!uid) {
        setLicenseStatus({ license: false, licenseStatus: "no-user" })
        return
      }

      try {
        // First check Firestore
        const subscriptionsQuery = query(
          collection(db, 'customers', uid, 'subscriptions'),
          where('status', 'in', ['active', 'trialing'])
        )
        const querySnapshot = await getDocs(subscriptionsQuery)
        
        if (querySnapshot.size > 0) {
          setLicenseStatus({
            license: true,
            licenseStatus: querySnapshot.docs[0].data().status
          })
          return
        }

        // If no active subscription in Firestore, check Realtime Database
        const database = getDatabase()
        const legacyStatusRef = ref(database, `users/${uid}/subscriptionStatus`)
        const snapshot = await get(legacyStatusRef)
        const legacyStatus = snapshot.val()

        if (legacyStatus === "active" || legacyStatus === "trialing") {
          setLicenseStatus({
            license: true,
            licenseStatus: legacyStatus
          })
        } else {
          setLicenseStatus({ license: false, licenseStatus: "off" })
        }
      } catch (error) {
        console.error("Error checking license:", error)
        setLicenseStatus({ license: false, licenseStatus: "error" })
      }
    }

    checkLicense()
  }, [uid])

  return licenseStatus
}