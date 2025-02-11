import React, { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { Disc2 } from "lucide-react"
import Modal from "./Modal"
import { Button } from "./ui/button"

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
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        size="sm"
        className="flex items-center gap-2">
        <span>Raptor Explorer</span>
        {isRecording && (
          <Disc2 className="h-4 w-4 text-red-500 animate-pulse" />
        )}
      </Button>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}

export default RaptorExplorerButton