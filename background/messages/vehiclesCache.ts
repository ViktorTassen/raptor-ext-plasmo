import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { vehicles, listName } = req.body
  
  console.log('[Raptor] Background received vehicles:', vehicles.length)
  
  res.send({ success: true })
}

export default handler