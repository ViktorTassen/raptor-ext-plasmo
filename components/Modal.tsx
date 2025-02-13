import React, { useRef, useState, useEffect } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import iconCropped from "data-base64:~assets/turrex-icon-cropped.png"
import VehicleTable from "./VehicleTable"
import type { Vehicle, EnrichmentProgress } from "~types"
import { enrichVehicle } from "~utils/enrichment"
import { Button } from "./ui/button"

const storage = new Storage({ area: "local" })

interface ModalProps {
  onClose: () => void
}

const Modal = ({ onClose }: ModalProps) => {
  const [isRecording, setIsRecording] = useStorage({
    key: "isRecording",
    instance: storage
  })

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [enrichProgress, setEnrichProgress] = useState<EnrichmentProgress>({
    current: 0,
    total: 0,
    isProcessing: false
  })
  const abortControllerRef = useRef<AbortController | null>(null)
  
  useEffect(() => {
    // Hide header when modal opens
    const header = document.querySelector('header')
    if (header) {
      header.style.display = 'none'
    }

    // Restore header visibility when modal closes
    return () => {
      const header = document.querySelector('header')
      if (header) {
        header.style.display = ''
      }
    }
  }, [])

  // Fetch vehicles from background
  const fetchVehicles = async () => {
    try {
      const response = await sendToBackground({
        name: "getVehicles"
      })
      if (response.success) {
        setVehicles(response.vehicles)
      }
    } catch (error) {
      console.error('[Raptor] Error fetching vehicles:', error)
    }
  }

  React.useEffect(() => {
    fetchVehicles()
  }, [])

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording)
  }

  const clearRecordings = async () => {
    try {
      await sendToBackground({
        name: "clearVehicles"
      })
      setVehicles([])
      console.log('[Raptor] Cleared all vehicles')
    } catch (error) {
      console.error('[Raptor] Error clearing vehicles:', error)
    }
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
    if (!vehicles?.length) {
      console.log('[Raptor] No vehicles to enrich')
      return
    }

    const unenrichedVehicles = vehicles.filter(v => !v.isEnriched)
    if (unenrichedVehicles.length === 0) {
      alert("All vehicles are already enriched!")
      return
    }

    // If recording is active, stop it first
    if (isRecording) {
      setIsRecording(false)
    }

    try {
      // Create new AbortController for this enrichment session
      abortControllerRef.current = new AbortController()
      
      setEnrichProgress({
        current: 0,
        total: unenrichedVehicles.length,
        isProcessing: true
      })

      // Enrich vehicles one by one
      for (let i = 0; i < unenrichedVehicles.length; i++) {
        if (abortControllerRef.current.signal.aborted) {
          console.log('[Raptor] Enrichment stopped by user')
          break
        }

        const vehicle = unenrichedVehicles[i]
        const enrichedVehicle = await enrichVehicle(vehicle, abortControllerRef.current.signal)
        
        if (enrichedVehicle) {
          // Update the vehicle in the background
          await sendToBackground({
            name: "updateVehicle",
            body: enrichedVehicle
          })
          // Update local state
          setVehicles(prev => prev.map(v => 
            v.id === enrichedVehicle.id ? enrichedVehicle : v
          ))
          console.log('[Raptor] Updated vehicle:', enrichedVehicle.id)
        }

        setEnrichProgress(prev => ({
          ...prev,
          current: i + 1
        }))
      }
    } catch (error) {
      console.error("[Raptor] Error enriching vehicles:", error)
      alert("Error enriching vehicles. Please try again.")
    } finally {
      abortControllerRef.current = null
      setEnrichProgress(prev => ({
        ...prev,
        isProcessing: false
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-250 flex justify-start">
      <div className="w-[95%] max-w-[95%] bg-white h-[calc(100vh)] shadow-xl 
        transform transition-transform duration-300 ease-in-out overflow-auto relative"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="p-6">
          <Button
            variant="link"
            size="icon"
            onClick={onClose}
            className="rounded-full absolute top-6 right-6 scale[2]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>

          <div>
            <img src={iconCropped} style={{ width: '33px', marginLeft: 10 }} />
            <div className="flex items-center space-x-4 mb-6">
              <Button
                onClick={handleRecordingToggle}
                variant={isRecording ? "destructive" : "default"}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              {vehicles?.length > 0 && (
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
              {vehicles?.length > 0 && (
                <Button
                  onClick={clearRecordings}
                  variant="secondary">
                  Clear All
                </Button>
              )}
            </div>

            {vehicles?.length > 0 ? (
              <VehicleTable vehicles={vehicles} />
            ) : (
              <div className="text-center text-gray-500 mt-8">
                No vehicles recorded yet. Start recording to collect data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal