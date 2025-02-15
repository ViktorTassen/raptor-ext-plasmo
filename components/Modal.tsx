import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { Download, Settings, Trash2 } from "lucide-react"
import iconCropped from "data-base64:~assets/turrex-car-nospace.png"
import VehicleTable from "./VehicleTable"
import SettingsModal from "./SettingsModal"
import type { Vehicle, EnrichmentProgress } from "~types"
import { enrichVehicle } from "~utils/enrichment"
import { exportVehiclesData } from "~utils/export"
import { Button } from "./ui/button"
import { PortalProvider } from "./ui/portal-container"
import { calculateMonthlyRevenue } from "~utils/revenue"
import { Separator } from "./ui/separator"

const storage = new Storage({ area: "local" })

interface ModalProps {
  onClose: () => void
}

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }: ConfirmDialogProps) => {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
      onClick={onClose}>
      <div 
        className="bg-white w-[30%] rounded-lg shadow-xl p-6"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

const Modal = ({ onClose }: ModalProps) => {
  const [isRecording, setIsRecording] = useStorage({
    key: "isRecording",
    instance: storage
  })

  const [includeDiscounts] = useStorage({
    key: "includeDiscounts",
    instance: storage,
  })

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [enrichProgress, setEnrichProgress] = useState<EnrichmentProgress>({
    current: 0,
    total: 0,
    isProcessing: false
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      header.style.display = 'none'
    }

    return () => {
      const header = document.querySelector('header')
      if (header) {
        header.style.display = ''
      }
    }
  }, [])

  const fetchVehicles = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Pre-calculate revenue data when vehicles or includeDiscounts changes
  const vehiclesWithRevenue = useMemo(() => {
    return vehicles.map(vehicle => ({
      ...vehicle,
      revenueData: calculateMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts)
    }))
  }, [vehicles, includeDiscounts])

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording)
  }

  const clearRecordings = async () => {
    try {
      await sendToBackground({
        name: "clearVehicles"
      })
      setVehicles([])
      setIsClearConfirmOpen(false)
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
    if (!vehicles?.length) return

    const unenrichedVehicles = vehicles.filter(v => !v.isEnriched)
    if (unenrichedVehicles.length === 0) {
      alert("All vehicles are already enriched!")
      return
    }

    if (isRecording) {
      setIsRecording(false)
    }

    try {
      abortControllerRef.current = new AbortController()

      setEnrichProgress({
        current: 0,
        total: unenrichedVehicles.length,
        isProcessing: true
      })

      for (let i = 0; i < unenrichedVehicles.length; i++) {
        if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) {
          break
        }

        const vehicle = unenrichedVehicles[i]
        const enrichedVehicle = await enrichVehicle(vehicle, abortControllerRef.current.signal)

        if (enrichedVehicle) {
          await sendToBackground({
            name: "updateVehicle",
            body: enrichedVehicle
          })

          setVehicles(prev => {
            const index = prev.findIndex(v => v.id === enrichedVehicle.id)
            if (index === -1) return prev
            const newArray = [...prev]
            newArray[index] = enrichedVehicle
            return newArray
          })
        }

        setEnrichProgress(prev => ({
          ...prev,
          current: i + 1
        }))
      }
    } catch (error) {
      console.error("[Raptor] Error enriching vehicles:", error)
    } finally {
      abortControllerRef.current = null
      setEnrichProgress(prev => ({
        ...prev,
        isProcessing: false
      }))
    }
  }

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <img src={iconCropped} alt="Logo" className="w-8 h-8" />
        
        {/* Recording controls */}
        {!enrichProgress.isProcessing && (
          <Button
            onClick={handleRecordingToggle}
            variant={isRecording ? "destructive" : "default"}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        )}

        {vehicles?.length > 0 && (
          <>
            <Separator orientation="vertical" className="h-8" />
            
            {/* Data processing controls */}
            <div className="flex items-center space-x-4">
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
            </div>

            <Separator orientation="vertical" className="h-8" />
            
            {/* Data management controls */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => exportVehiclesData(vehiclesWithRevenue)}
                variant="outline"
                className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => setIsClearConfirmOpen(true)}
                variant="ghost"
                className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </>
        )}

        <Separator orientation="vertical" className="h-8" />

        {/* Settings */}
        <Button
          variant="secondary"
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="rounded-full">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-25 flex justify-start">
      <PortalProvider>
        <div className="w-[95%] max-w-[95%] bg-white h-[calc(100vh)] shadow-xl 
          transform transition-transform duration-300 ease-in-out overflow-auto relative">
          <div className="p-6">
            {renderHeader()}
            {vehicles?.length > 0 ? (
              <VehicleTable vehicles={vehiclesWithRevenue} />
            ) : (
              <div className="text-center text-gray-500 mt-8">
                No vehicles recorded yet. Start recording to collect data.
              </div>
            )}
          </div>
        </div>

        {isSettingsOpen && (
          <SettingsModal onClose={() => setIsSettingsOpen(false)} />
        )}

        <ConfirmDialog
          isOpen={isClearConfirmOpen}
          onClose={() => setIsClearConfirmOpen(false)}
          onConfirm={clearRecordings}
          title="Clear All Data"
          message="This action cannot be undone."
        />
      </PortalProvider>
    </div>
  )
}

export default Modal