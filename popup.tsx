import { type FC, useState, useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"

import SignInPopup from "~components/SignInPopup"

import "~style.css"

type TabType = "send" | "logs" | "account"

const Popup: FC = () => {
  const [user] = useStorage<{ email: string; uid: string } | null>("user", null)

  // Verify balance when popup opens
  useEffect(() => {
    if (user?.uid) {
     // verify license
    }
  }, [user?.uid])



  return (
    <div className="w-[400px] h-[400px] flex flex-col bg-surface">
    


    {!user && (
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <SignInPopup />
      </div>
    )}
  </div>
  )
}

export default Popup