import React, { useState } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { Disc2 } from "lucide-react"
import Modal from "./Modal"
import { Button } from "./ui/button"

const RaptorExplorerButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRecording] = useStorage({
    key: "isRecording",
    instance: new Storage()
  })

  return (
    <>
      <Button
        variant="default"
        onClick={() => setIsModalOpen(true)}
        size="sm"
        className="flex items-center gap-2 z-250">
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