import { useState, useEffect } from "react"
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore"
import { getDatabase, ref, onValue } from "firebase/database"
import { db, rtdb } from "~firebase/firebaseClient"

export const useLicense = (uid: string | undefined) => {
  const [licenseStatus, setLicenseStatus] = useState<{
    license: boolean
    licenseStatus: string
  }>({ license: false, licenseStatus: "loading" })

  useEffect(() => {
    let isMounted = true
    let unsubscribeFirestore: (() => void) | undefined
    let unsubscribeRTDB: (() => void) | undefined

    const setupSubscriptions = async () => {
      if (!uid) {
        if (isMounted) {
          setLicenseStatus({ license: false, licenseStatus: "no-user" })
        }
        return
      }

      try {
        // Subscribe to Firestore changes
        const subscriptionsQuery = query(
          collection(db, 'customers', uid, 'subscriptions'),
          where('status', 'in', ['active', 'trialing'])
        )

        unsubscribeFirestore = onSnapshot(subscriptionsQuery, (snapshot) => {
          if (isMounted) {
            if (snapshot.size > 0) {
              setLicenseStatus({
                license: true,
                licenseStatus: snapshot.docs[0].data().status
              })
            } else {
              // If no active subscription in Firestore, check RTDB
              const database = getDatabase()
              const legacyStatusRef = ref(database, `users/${uid}/subscriptionStatus`)
              
              unsubscribeRTDB = onValue(legacyStatusRef, (snapshot) => {
                const legacyStatus = snapshot.val()
                
                if (isMounted) {
                  if (legacyStatus === "active" || legacyStatus === "trialing") {
                    setLicenseStatus({
                      license: true,
                      licenseStatus: legacyStatus
                    })
                  } else {
                    setLicenseStatus({ license: false, licenseStatus: "off" })
                  }
                }
              })
            }
          }
        }, (error) => {
          console.error("Error in Firestore subscription:", error)
          if (isMounted) {
            setLicenseStatus({ license: false, licenseStatus: "error" })
          }
        })

      } catch (error) {
        console.error("Error setting up license subscriptions:", error)
        if (isMounted) {
          setLicenseStatus({ license: false, licenseStatus: "error" })
        }
      }
    }

    setupSubscriptions()

    return () => {
      isMounted = false
      if (unsubscribeFirestore) {
        unsubscribeFirestore()
      }
      if (unsubscribeRTDB) {
        unsubscribeRTDB()
      }
    }
  }, [uid])

  return licenseStatus
}