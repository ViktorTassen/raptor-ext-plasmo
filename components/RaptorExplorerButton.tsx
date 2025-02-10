import React, { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import Modal from "./Modal"

const storage = new Storage({area:"local"})

const RaptorExplorerButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    // Load initial state
    storage.get<boolean>("isRecording").then(state => setIsRecording(state ?? false))

    // Set up storage listener
    storage.watch({
      isRecording: (change) => {
        const newValue = change?.newValue
        setIsRecording(newValue === true)
      }
    })
  }, [])

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 rounded-md font-medium text-xs transition-colors bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
        <span>Raptor Explorer</span>
        {isRecording && (
          <span className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2"></span>
          </span>
        )}
      </button>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}

export default RaptorExplorerButton