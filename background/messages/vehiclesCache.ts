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
    
    // Store vehicles directly using bulkPut
    await db.vehicles.bulkPut(vehicles)
    console.log('[Raptor] Stored', vehicles.length, 'vehicles in IndexedDB')
    
    res.send({ success: true })
  } catch (error) {
    console.error('[Raptor] Error in vehiclesCache handler:', error)
    res.send({ success: false, error: error.message })
  }
}

export default handler