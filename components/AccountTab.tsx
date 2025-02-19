import { useState, type FC } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { auth } from "~firebase/firebaseClient"
import { LogOut, ExternalLink, User, Mail, Crown } from "lucide-react"
import { useLicense } from "~hooks/useLicense"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

const storage = new Storage({ area: "local" })

const AccountTab: FC = () => {
  const [user] = useStorage({
    key: "user",
    instance: storage
  })
  const [loading, setLoading] = useState(false)
  const licenseStatus = useLicense(user?.uid)

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

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Profile Section */}
      <div className="bg-white px-6 py-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            {user.displayName ? (
              <span className="text-lg font-medium">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-medium text-gray-900 truncate">
              {user.displayName || "My Account"}
            </h2>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* License Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">License Status</h3>
            <div className="mt-1">
              {licenseStatus.licenseStatus === "loading" ? (
                <Badge variant="secondary">Checking...</Badge>
              ) : licenseStatus.license ? (
                <Badge variant="success">
                  {licenseStatus.licenseStatus === "trialing" ? "Trial" : "Active"}
                </Badge>
              ) : (
                <Badge variant="warning">Inactive</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Customer Portal Button */}
        <Button
          onClick={handleManageClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Manage Subscription
        </Button>
      </div>

      {/* Support Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">Need Help?</h3>
            <a
              href="mailto:support@raptorexplorer.com"
              className="text-sm text-primary hover:text-primary-600">
              support@raptorexplorer.com
            </a>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="mt-auto mb-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  )
}

export default AccountTab