import React from "react"
import { Download, Settings, Trash2, Crown, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import type { Vehicle, EnrichmentProgress } from "~types"
import { useAuth } from "~hooks/useAuth"
import { sendToBackground } from "@plasmohq/messaging"

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
  user: any
  licenseStatus: { license: boolean; licenseStatus: string }
  isEnrichDisabled: boolean
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
  onClose,
  user,
  licenseStatus,
  isEnrichDisabled
}: ModalHeaderProps) => {
  const { isLoading, handleGoogleSignIn } = useAuth()
  const enrichedCount = vehicles.filter(v => v.isEnriched).length

  const handleUpgradeClick = async () => {
    await sendToBackground({
      name: "openOptions"
    })
  }

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
            {isLoading ? "Signing in..." : 
               <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            
            }
          </Button>
        ) : (
          <>
            {/* Upgrade button */}
            {!licenseStatus.license && (
              <>
                <Button
                  onClick={handleUpgradeClick}
                  className="bg-[#593CFB] hover:bg-[#593CFB]/90 text-white flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Upgrade to PRO
                </Button>
                <Separator orientation="vertical" className="h-8" />
              </>
            )}

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
                    disabled={enrichProgress.isProcessing || isEnrichDisabled}
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
            
            <Separator orientation="vertical" className="h-8" />
            {/* Extension and Help Links */}
            <div className="flex items-center space-x-4">
              <a
                href="https://raptorexplorer.com/instructions"
                target="_blank"
                rel="noopener noreferrer">
                <Button
                  variant="link"
                  className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Instructions
                </Button>
              </a>
            </div>

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