import { useState, type FC } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { auth } from "~firebase/firebaseClient"
import { LogOut, CreditCard, FileStack, ExternalLink, User, Mail } from "lucide-react"
const storage = new Storage()

const AccountTab: FC = () => {
  const [user] = useStorage<{ email: string; uid: string; displayName: string } | null>("user")
  const [loading, setLoading] = useState(false)


  const handleManageClick = async () => {
    setLoading(true);

    try {
      if (!user || !user.email) {
        throw new Error('User not authenticated');
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
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe Portal
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error creating portal session:', error);
      // Handle error (show toast, alert, etc.)
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = async () => {
    try {
      await auth.signOut()
      await storage.remove("user")
      await storage.remove("remainingPages")
      window.location.reload()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      {/* Profile Section */}
      <div className="bg-white px-4 py-3 border-gray-200">
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
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {/* Pages Balance Card
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileStack className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining Pages</p>
                  <p className="text-2xl font-medium text-gray-900">{remainingPages}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const url = chrome.runtime.getURL("tabs/pricing.html");
                  chrome.tabs.create({ url });
                }} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full
                         hover:bg-primary-600 transition-colors text-sm font-medium">
                <CreditCard className="w-4 h-4" />
                Add Pages
              </button>
            </div>
          </div>
        </div> */}


        {/* Customer Portal */}
        <button
          onClick={handleManageClick}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-medium text-gray-900">Customer Portal</span>
            <p className="text-sm text-gray-600">Manage your billing</p>
          </div>
        </button>


        {/* Support Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Support Email</p>
                  <a
                    href="mailto:support@raptorexplorer.com"
                    className="text-sm text-primary hover:text-primary-600 font-medium">
                    support@raptorexplorer.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>




        {/* Sign Out Button - Fixed at Bottom */}
        <div className="mt-auto pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 
                   rounded-lg transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

      </div>


    </div>
  )
}

export default AccountTab
