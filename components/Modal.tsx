import React, { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({area: "local"})

interface ModalProps {
  onClose: () => void
}

const Modal = ({ onClose }: ModalProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])

  useEffect(() => {
    // Load initial state
    storage.get<boolean>("isRecording").then(state => setIsRecording(state ?? false))
    storage.get<any[]>("recordedVehicles").then(data => setVehicles(data ?? []))

    // Set up storage listeners
    storage.watch({
      isRecording: (change) => {
        const newValue = change?.newValue
        setIsRecording(newValue === true)
      },
      recordedVehicles: (change) => {
        const newValue = change?.newValue as any[] | undefined
        setVehicles(newValue ?? [])
      }
    })
  }, [])

  const handleRecordingToggle = async () => {
    const newState = !isRecording
    await storage.set("isRecording", newState)
    setIsRecording(newState)
  }

  const clearRecordings = async () => {
    await storage.set("recordedVehicles", [])
    setVehicles([])
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-start">
      <div className="w-[85%] max-w-[85%] bg-white h-[calc(100vh-80px)] mt-[80px] rounded-r-lg shadow-xl 
        transform transition-transform duration-300 ease-in-out overflow-auto"
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
              {vehicles.length > 0 && (
                <button
                  onClick={clearRecordings}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700">
                  Clear All
                </button>
              )}
            </div>

            {vehicles.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.make}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal