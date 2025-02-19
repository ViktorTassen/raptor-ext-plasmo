import React from "react"
import { Download, Settings, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import type { Vehicle, EnrichmentProgress } from "~types"
import { useAuth } from "~hooks/useAuth"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

const storage = new Storage({ area: "local" })

interface ModalHeaderProps {
  iconCropped: string
  isRecording: boolean
  vehicles: Vehicle[]
  enrichProgress: EnrichmentProgress
  onRecordingToggle: () => void
  onEnrichData: () => void
  onStopEnrichment: () => void
  onExportData: () => void
  onClearData: () => void
  onOpenSettings: () => void
  onClose: () => void
}

const ModalHeader = ({
  iconCropped,
  isRecording,
  vehicles,
  enrichProgress,
  onRecordingToggle,
  onEnrichData,
  onStopEnrichment,
  onExportData,
  onClearData,
  onOpenSettings,
  onClose
}: ModalHeaderProps) => {
  const { isLoading, handleGoogleSignIn } = useAuth()
  const [user] = useStorage({
    key: "user",
    instance: storage
  })

  const enrichedCount = vehicles.filter(v => v.isEnriched).length

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <img src={iconCropped} alt="Logo" className="w-8 h-8" />
        
        {/* Sign in / User info */}
        {!user ? (
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="default">
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        ) : (
          <>
            {/* Recording controls */}
            {!enrichProgress.isProcessing && (
              <Button
                onClick={onRecordingToggle}
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
                    onClick={onEnrichData}
                    disabled={enrichProgress.isProcessing}
                    variant="default">
                    {enrichProgress.isProcessing
                      ? `Enriching (${enrichedCount}/${vehicles.length})`
                      : `Enrich Data (${enrichedCount}/${vehicles.length})`}
                  </Button>
                  {enrichProgress.isProcessing && (
                    <Button
                      onClick={onStopEnrichment}
                      variant="destructive">
                      Stop Enriching
                    </Button>
                  )}
                </div>

                <Separator orientation="vertical" className="h-8" />
                
                {/* Data management controls */}
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={onExportData}
                    variant="outline"
                    className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button
                    onClick={onClearData}
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
              onClick={onOpenSettings}
              className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </>
        )}
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
}

export default ModalHeader