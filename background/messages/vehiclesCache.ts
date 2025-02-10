import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import type { Vehicle } from "~types"

const storage = new Storage({area: "local"})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { vehicles } = req.body
  
  console.log('[Raptor] Background received vehicles:', vehicles.length)
  
  // Check if recording is active
  const isRecording = await storage.get<boolean>("isRecording")
  if (!isRecording) {
    return res.send({ success: true })
  }

  // Get existing vehicles
  const existingVehicles = await storage.get<Vehicle[]>("recordedVehicles") || []
    
  // Filter out duplicates
  const uniqueVehicles = vehicles.filter(newVehicle => 
    !existingVehicles.some(existingVehicle => existingVehicle.id === newVehicle.id)
  )

  if (uniqueVehicles.length > 0) {
    // Save combined vehicles to storage
    const updatedVehicles = [...existingVehicles, ...uniqueVehicles]
    await storage.set("recordedVehicles", updatedVehicles)
    console.log('[Raptor] Saved', uniqueVehicles.length, 'new vehicles')
  }

  res.send({ success: true })
}

export default handler