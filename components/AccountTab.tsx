import { useState, useEffect, type FC } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { auth } from "~firebase/firebaseClient"
import { LogOut, ExternalLink, User, Crown, HelpCircle, CreditCard, FileText } from "lucide-react"
import { useLicense } from "~hooks/useLicense"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import stripe from "data-base64:~assets/stripe.png"

const storage = new Storage({ area: "local" })

const AccountTab: FC = () => {
  const [user] = useStorage({
    key: "user",
    instance: storage
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const licenseStatus = useLicense(user?.uid)
  const isLoading = licenseStatus.licenseStatus === "loading" || initialLoading

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleManageClick = async () => {
    setLoading(true)

    try {
      if (!user || !user.email) {
        throw new Error('User not authenticated')
      }

      const response = await fetch('https://raptor3-web.vercel.app/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      window.open(url, '_blank')
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckoutClick = async () => {
    setLoading(true)

    try {
      const response = await fetch('https://raptor3-web.vercel.app/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      window.open(url, '_blank')
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      await storage.remove("user")
      window.location.reload()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-3 space-y-3">
        {/* Profile Section Skeleton */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-1" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* License Section Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-9 w-40" />
          </div>
          <Skeleton className="h-8 w-full" />
        </div>

        {/* Resources Section Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-5 w-20 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Sign Out Button Skeleton */}
        <div className="mt-auto">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-3 space-y-3">
      {/* Profile Section */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            {user.displayName ? (
              <span className="text-base font-medium">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-medium text-gray-900 truncate">
              {user.displayName || "My Account"}
            </h2>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">ID: {user.uid}</span>
              <span className="text-xs text-gray-400">•</span>
              <Badge variant={licenseStatus.license ? "success" : "warning"} className="text-xs">
                {licenseStatus.license ? "Active" : "Free"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* License Status & Upgrade Section */}
      {!licenseStatus.license && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600">Get advanced analytics & insights:</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#593CFB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Unlimited search results and export</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold">$15<span className="text-sm text-gray-500">/mo</span></span>
          <Button
              onClick={handleCheckoutClick}
              className="bg-[#04B101] hover:bg-[#04B101]/90 text-white font-bold">
              Complete purchase
            </Button>
          </div>
          <img 
            src={stripe}
            alt="Payment methods"
            className="w-full h-auto"
          />
        </div>
      )}

      {licenseStatus.license && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Button
            onClick={handleManageClick}
            disabled={loading}
            className="w-full bg-[#593CFB] hover:bg-[#593CFB]/90 text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
          <p className="mt-2 text-xs text-center text-gray-500">
            Change billing details, payment method, or download invoices
          </p>
        </div>
      )}

      {/* Help & Support Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Resources</h3>
            <div className="space-y-2">
              <a
                href="https://raptorexplorer.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#593CFB]">
                <FileText className="w-4 h-4" />
                Documentation & Guides
              </a>
              <a
                href="mailto:support@raptorexplorer.com"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#593CFB]">
                <HelpCircle className="w-4 h-4" />
                support@raptorexplorer.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="mt-auto">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  )
}

export default AccountTab