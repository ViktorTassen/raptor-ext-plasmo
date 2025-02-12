import type { PlasmoMessaging } from "@plasmohq/messaging"
import { db } from "~/background"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const vehicles = await db.vehicles.toArray()
    res.send({ success: true, vehicles })
  } catch (error) {
    console.error('[Raptor] Error getting vehicles:', error)
    res.send({ success: false, error: error.message })
  }
}

export default handler