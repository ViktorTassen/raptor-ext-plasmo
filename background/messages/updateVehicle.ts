import type { PlasmoMessaging } from "@plasmohq/messaging"
import { db } from "~/background"
import type { Vehicle } from "~types"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const vehicle = req.body as Vehicle
    await db.vehicles.put(vehicle)
    res.send({ success: true })
  } catch (error) {
    console.error('[Raptor] Error updating vehicle:', error)
    res.send({ success: false, error: error.message })
  }
}

export default handler