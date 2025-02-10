import React, { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import type { RecordingState, Vehicle } from "~types"

const storage = new Storage()

interface VehicleEvent extends CustomEvent {
  detail: {
    vehicles: Vehicle[]
  }
}

interface ModalProps {
  onClose: () => void
}

const Modal = ({ onClose }: ModalProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [listName, setListName] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    const handleVehicles = async (event: VehicleEvent) => {
      if (isRecording) {
        const vehiclesData = event.detail.vehicles
        setVehicles(prev => [...prev, ...vehiclesData])
      }
    }

    window.addEventListener('vehicles', handleVehicles as EventListener)
    return () => {
      window.removeEventListener('vehicles', handleVehicles as EventListener)
    }
  }, [isRecording])

  const handleRecordingToggle = async () => {
    const newRecordingState = !isRecording
    setIsRecording(newRecordingState)
    
    if (!newRecordingState && vehicles.length > 0) {
      // Save the recorded data when stopping
      await storage.set("recordedVehicles", vehicles)
      setVehicles([])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-start">
      <div className="w-[85%] max-w-[85%] bg-white h-[calc(100vh-80px)] mt-[80px] rounded-r-lg shadow-xl 
        transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Raptor Explorer</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRecordingToggle}
                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              {isRecording && (
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></span>
                  Recording...
                </span>
              )}
            </div>

            {isRecording && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Vehicles captured: {vehicles.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal