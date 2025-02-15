import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { db } from "~/background"

const storage = new Storage({ area: "local" })

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { vehicles } = req.body
  
  try {
    // Check recording status first
    const isRecording = await storage.get<boolean>("isRecording")
    if (!isRecording) {
      console.log('[Raptor] Recording is disabled, skipping data storage')
      res.send({ success: false, reason: 'recording_disabled' })
      return
    }
    
    console.log('[Raptor] Background received vehicles:', vehicles.length)
    
    // Get existing vehicle IDs
    const existingIds = new Set(await db.vehicles.orderBy('id').primaryKeys())
    
    // Filter out vehicles that already exist
    const newVehicles = vehicles.filter(v => !existingIds.has(v.id))
    
    if (newVehicles.length > 0) {
      // Store new vehicles
      await db.vehicles.bulkPut(newVehicles)
      console.log('[Raptor] Stored', newVehicles.length, 'new vehicles in IndexedDB')
      
      // Update the new vehicles count in storage
      const currentCount = await storage.get<number>("newVehiclesCount") || 0
      await storage.set("newVehiclesCount", currentCount + newVehicles.length)
    }
    
    res.send({ success: true, newCount: newVehicles.length })
  } catch (error) {
    console.error('[Raptor] Error in vehiclesCache handler:', error)
    res.send({ success: false, error: error.message })
  }
}

export default handler