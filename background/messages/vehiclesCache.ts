import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage"

 


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { vehicles } = req.body;
  console.log(vehicles)

  res.send({
    success: true
  })
};

export default handler;