import { type FC } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import SignInPopup from "~components/SignInPopup"
import AccountTab from "~components/AccountTab"
import "~style.css"

const storage = new Storage({ area: "local" })

const Popup: FC = () => {
  const [user] = useStorage({
    key: "user",
    instance: storage
  })

  return (
    <div className="w-[400px] max-h-[500px] flex flex-col bg-surface">
      {!user ? <SignInPopup /> : <AccountTab />}
    </div>
  )
}

export default Popup