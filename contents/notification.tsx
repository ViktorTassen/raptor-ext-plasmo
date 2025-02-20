import { useEffect, useState } from "react"
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*"]
}

const storage = new Storage({ area: "local" })

// Use CSS modules for better style isolation
export const getStyle = () => {
    const style = document.createElement("style")
    style.textContent = cssText.replaceAll(':root', ':host(plasmo-csui)');
    return style
}


function CheckCircleIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-green-500"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}

function Notification() {


    useEffect(() => {
        storage.watch({
            "newVehiclesCount": (c) => {
                // open snackbar with message 
                console.log("Unique vehicles added: +" + c.newValue)
                setShow(true)
                const timer = setTimeout(() => {
                    setShow(false)
                }, 5000)
                return () => clearTimeout(timer)
            }
        });
    }, []);


    const [newVehiclesCount] = useStorage({
        key: "newVehiclesCount",
        instance: storage
    })
    const [show, setShow] = useState(false)

    if (!show) return null

    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#593cfb] text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
            <CheckCircleIcon />
            <span className="font-medium">
                Added {newVehiclesCount.qty} new vehicles
            </span>
        </div>
    )
}

export default Notification