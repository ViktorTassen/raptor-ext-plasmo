import React, { useState, useEffect, useRef } from "react"

import { Storage } from "@plasmohq/storage"
import VehicleTable from "./VehicleTable"
import type { Vehicle, EnrichmentProgress } from "~types"
import { enrichVehicles } from "~utils/enrichment"
import { Button } from "./ui/button"

const storage = new Storage({area: "local"})

interface ModalProps {
  onClose: () => void
}

const Modal = ({ onClose }: ModalProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [enrichProgress, setEnrichProgress] = useState<EnrichmentProgress>({
    current: 0,
    total: 0,
    isProcessing: false
  })
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Load initial state
    storage.get<boolean>("isRecording").then(state => setIsRecording(state ?? false))
    storage.get<Vehicle[]>("recordedVehicles").then(data => setVehicles(data ?? []))

    // Set up storage listeners
    storage.watch({
      isRecording: (change) => {
        const newValue = change?.newValue
        setIsRecording(newValue === true)
      },
      recordedVehicles: (change) => {
        const newValue = change?.newValue as Vehicle[] | undefined
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

  const stopEnrichment = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setEnrichProgress(prev => ({
        ...prev,
        isProcessing: false
      }))
    }
  }

  const handleEnrichData = async () => {
    if (isRecording) {
      alert("Please stop recording before enriching data")
      return
    }

    const unenrichedVehicles = vehicles.filter(v => !v.isEnriched)
    if (unenrichedVehicles.length === 0) {
      alert("All vehicles are already enriched!")
      return
    }

    try {
      // Create new AbortController for this enrichment session
      abortControllerRef.current = new AbortController()

      const enrichedVehicles = await enrichVehicles(
        unenrichedVehicles, 
        (progress) => {
          setEnrichProgress(progress)
        },
        abortControllerRef.current.signal
      )

      // Combine enriched vehicles with already enriched ones
      const updatedVehicles = [
        ...vehicles.filter(v => v.isEnriched),
        ...enrichedVehicles
      ]

      await storage.set("recordedVehicles", updatedVehicles)
      setVehicles(updatedVehicles)
    } catch (error) {
      console.error("Error enriching vehicles:", error)
      alert("Error enriching vehicles. Please try again.")
    } finally {
      abortControllerRef.current = null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-start">
      <div className="w-[85%] max-w-[85%] bg-white h-[calc(100vh-80px)] mt-[80px] shadow-xl 
        transform transition-transform duration-300 ease-in-out overflow-auto"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="p-6">
          <div className="flex justify-end items-center mb-6">
            <Button
              variant="default"
              size="icon"
              onClick={onClose}
              className="rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRecordingToggle}
                variant={isRecording ? "destructive" : "default"}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              {vehicles.length > 0 && !isRecording && (
                <>
                  <Button
                    onClick={handleEnrichData}
                    disabled={enrichProgress.isProcessing}
                    variant="default">
                    {enrichProgress.isProcessing 
                      ? `Enriching ${enrichProgress.current}/${enrichProgress.total}` 
                      : 'Enrich Data'}
                  </Button>
                  {enrichProgress.isProcessing && (
                    <Button
                      onClick={stopEnrichment}
                      variant="destructive">
                      Stop Enriching
                    </Button>
                  )}
                </>
              )}
              {vehicles.length > 0 && (
                <Button
                  onClick={clearRecordings}
                  variant="secondary">
                  Clear All
                </Button>
              )}
            </div>

            {vehicles.length > 0 && (
              <VehicleTable vehicles={vehicles} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal