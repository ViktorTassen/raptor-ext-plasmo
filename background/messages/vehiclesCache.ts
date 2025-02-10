import type { PlasmoMessaging } from "@plasmohq/messaging"
import { RaptorDatabase } from "~storage/db"

const db = new RaptorDatabase()

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { vehicles, listName } = req.body
  
  try {
    await db.addVehicles(listName, vehicles)
    res.send({ success: true })
  } catch (error) {
    console.error("Error saving vehicles:", error)
    res.send({ success: false, error: error.message })
  }
}

export default handler