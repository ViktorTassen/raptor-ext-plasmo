import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import iconCropped from "data-base64:~assets/turrex-car-nospace.png"
import VehicleTable from "./VehicleTable"
import SettingsModal from "./SettingsModal"
import ModalHeader from "./ModalHeader"
import type { Vehicle, EnrichmentProgress } from "~types"
import { enrichVehicle } from "~utils/enrichment"
import { exportVehiclesData } from "~utils/export"
import { Button } from "./ui/button"
import { PortalProvider } from "./ui/portal-container"
import { calculateMonthlyRevenue } from "~utils/revenue"
import { useLicense } from "~hooks/useLicense"

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

  const [applyProtectionPlan] = useStorage({
    key: "applyProtectionPlan",
    instance: storage
  })

  const [user] = useStorage({
    key: "user",
    instance: storage
  })

  const licenseStatus = useLicense(user?.uid)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
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

  const vehiclesWithRevenue = useMemo(() => {
    return vehicles.map(vehicle => ({
      ...vehicle,
      revenueData: vehicle.dailyPricing 
        ? calculateMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan) 
        : []
    }))
  }, [vehicles, includeDiscounts, applyProtectionPlan])

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

  const handleClose = () => {
    stopEnrichment()
    onClose()
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

  if (initialLoading || licenseStatus.licenseStatus === "loading") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-25 flex justify-start">
        <div className="w-[95%] max-w-[95%] bg-white h-[calc(100vh)] shadow-xl">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <img src={iconCropped} alt="Logo" className="w-8 h-8" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-25 flex justify-start">
      <PortalProvider>
        <div className="w-[95%] max-w-[95%] bg-white h-[calc(100vh)] shadow-xl 
          transform transition-transform duration-300 ease-in-out overflow-auto relative">
          <div className="p-6">
            <ModalHeader
              iconCropped={iconCropped}
              isRecording={isRecording}
              vehicles={vehicles}
              enrichProgress={enrichProgress}
              onRecordingToggle={handleRecordingToggle}
              onEnrichData={handleEnrichData}
              onStopEnrichment={stopEnrichment}
              onExportData={() => exportVehiclesData(vehiclesWithRevenue, includeDiscounts, applyProtectionPlan)}
              onClearData={() => setIsClearConfirmOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onClose={handleClose}
              user={user}
              licenseStatus={licenseStatus}
            />
            <VehicleTable vehicles={vehiclesWithRevenue} />
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