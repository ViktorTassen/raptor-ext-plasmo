import cssText from "data-text:~style.css"
import { useState } from "react"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { RaptorDatabase } from "~storage/db"

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/us/en/search*"],
  all_frames: true
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  const searchFilterElement = document.querySelector('.searchFilter')
  const parentElement = searchFilterElement ? searchFilterElement.parentElement : null

  return {
    element: parentElement,
    insertPosition: "afterbegin"
  }
}

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div 
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      <div 
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[85%] bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="h-[80px] border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold">Raptor Explorer</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

const RecordingSection = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [listName, setListName] = useState("")
  
  const toggleRecording = () => {
    if (!isRecording && !listName.trim()) {
      alert("Please enter a list name before starting recording")
      return
    }
    
    setIsRecording(!isRecording)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          List Name
        </label>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          disabled={isRecording}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          placeholder="Enter list name..."
        />
      </div>
      <button
        onClick={toggleRecording}
        className={`w-full px-4 py-2 rounded-md font-medium text-white transition-colors ${
          isRecording 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  )
}

const RaptorExplorerButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors">
        Raptor Explorer
      </button>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RecordingSection />
      </Modal>
    </>
  )
}

const PlasmoInject = () => {
  return <RaptorExplorerButton />
}

export default PlasmoInject