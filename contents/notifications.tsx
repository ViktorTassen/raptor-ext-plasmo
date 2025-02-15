import cssText from "data-text:~style.css"
import { useEffect } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { Toaster, toast } from "sonner"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"

const storage = new Storage({ area: "local" })

export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/us/en/search*"],
    all_frames: true,
    world: "MAIN",
  };

  
  // Use CSS modules for better style isolation
  export const getStyle = () => {
    const style = document.createElement("style")
    style.textContent = cssText.replaceAll(':root', ':host(plasmo-csui)');
    return style
  }
  
  // Remove shadow DOM as it might interfere with Tailwind
  export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
    const searchFilterElement = document.querySelector('body')
    const parentElement = searchFilterElement ? searchFilterElement.parentElement : null
  
    return {
      element: parentElement,
      insertPosition: "afterbegin"
    }
  }

  
function NotificationsOverlay() {
  const [newVehiclesCount] = useStorage({
    key: "newVehiclesCount",
    instance: storage
  })

  useEffect(() => {
    if (newVehiclesCount && newVehiclesCount > 0) {
      toast.success(`${newVehiclesCount} new ${newVehiclesCount === 1 ? 'vehicle' : 'vehicles'} added`, {
        description: "New unique vehicles have been added to your database."
      })
      // Reset the counter after showing the notification
      storage.set("newVehiclesCount", 0)
    }
  }, [newVehiclesCount])

  return <Toaster position="top-right" expand={true} richColors />
}

export default NotificationsOverlay