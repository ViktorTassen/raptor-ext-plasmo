import React, { useState } from "react"
import Modal from "./Modal"

const RaptorExplorerButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 rounded-md font-medium text-sm transition-colors bg-blue-600 hover:bg-blue-700 text-white">
        Raptor Explorer
      </button>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}

export default RaptorExplorerButton