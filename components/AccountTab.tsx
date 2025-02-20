import { useState, useEffect, type FC } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { auth } from "~firebase/firebaseClient"
import { LogOut, ExternalLink, User, Crown, HelpCircle, CreditCard, FileText, CheckCircle2, Zap } from "lucide-react"
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
      <div className="flex flex-col h-full p-4 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-3 w-40 mb-1" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-2 w-20" />
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Profile Section with Help Links */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
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
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[11px] text-gray-400 truncate">ID: {user.uid}</span>
                <span className="text-[11px] text-gray-400">•</span>
                <Badge variant={licenseStatus.license ? "success" : "warning"} className="text-[10px] px-1 py-0">
                  {licenseStatus.license ? "Active" : "Free"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Help Links - Integrated into profile section */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <a
              href="https://raptorexplorer.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#593CFB] transition-colors">
              <FileText className="w-3.5 h-3.5" />
              <span>Docs</span>
            </a>
            <a
              href="mailto:support@raptorexplorer.com"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#593CFB] transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>support@raptorexplorer.com</span>
            </a>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="ml-auto text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-6 px-2">
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* License Status & Upgrade Section */}
      {!licenseStatus.license && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#593CFB]" />
              <h3 className="text-sm font-medium text-gray-900">Upgrade to Pro</h3>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#593CFB] mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-900">Unlimited search results</p>
                  <p className="text-[11px] text-gray-500">Search and analyze unlimited vehicles</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#593CFB] mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-900">Advanced analytics & exports</p>
                  <p className="text-[11px] text-gray-500">ROI calculations and data exports</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg text-gray-400">$</span>
                <span className="text-3xl font-bold text-gray-900">15</span>
                <span className="text-xs text-gray-500">/mo</span>
              </div>
              <Button
                onClick={handleCheckoutClick}
                disabled={loading}
                size="sm"
                className="bg-[#593CFB] hover:bg-[#593CFB]/90 text-white font-medium px-4 py-1 h-8">
                {loading ? "Processing..." : "Upgrade now"}
              </Button>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <img 
              src={stripe}
              alt="Payment methods"
              className="w-auto"
            />
          </div>
        </div>
      )}

      {licenseStatus.license && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <Button
            onClick={handleManageClick}
            disabled={loading}
            size="sm"
            className="w-full bg-[#593CFB] hover:bg-[#593CFB]/90 text-white h-8">
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Manage Subscription
          </Button>
          <p className="mt-2 text-[11px] text-center text-gray-500">
            Manage billing details and invoices
          </p>
        </div>
      )}
    </div>
  )
}

export default AccountTab