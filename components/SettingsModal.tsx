import React from "react"
import { Settings } from "lucide-react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"

const storage = new Storage({ area: "local" })

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const [includeDiscounts, setIncludeDiscounts] = useStorage({
    key: "includeDiscounts",
    instance: storage,
  })

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center"
      onClick={onClose}>
      <div 
        className="bg-white w-[30%] rounded-lg shadow-xl p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Apply Weekly/Monthly Discounts</h3>
              <p className="text-sm text-gray-500">
                Calculate revenue with discounts applied
              </p>
            </div>
            <Switch
              checked={includeDiscounts}
              onCheckedChange={setIncludeDiscounts}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal