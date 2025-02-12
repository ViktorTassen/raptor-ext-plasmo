import type { PlasmoMessaging } from "@plasmohq/messaging"
import { db } from "~/background"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    await db.vehicles.clear()
    res.send({ success: true })
  } catch (error) {
    console.error('[Raptor] Error clearing vehicles:', error)
    res.send({ success: false, error: error.message })
  }
}

export default handler