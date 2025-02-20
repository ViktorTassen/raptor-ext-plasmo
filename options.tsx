import { type FC } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import AccountTab from "~components/AccountTab"
import SignInPopup from "~components/SignInPopup"
import "~style.css"

const storage = new Storage({ area: "local" })

const Options: FC = () => {
  const [user] = useStorage({
    key: "user",
    instance: storage
  })

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-xl mx-auto p-4">
        {!user ? <SignInPopup /> : <AccountTab />}
      </div>
    </div>
  )
}

export default Options