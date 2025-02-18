import type { PlasmoMessaging } from "@plasmohq/messaging"


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {

   try {
     const params = new URLSearchParams({
       year: vehicle.year.toString(),
       make: vehicle.make,
       model: vehicle.model,
       ...(trim && { trim })
     });
 
     const response = await fetch(`https://raptor3-web.vercel.app/api/vehicle/market-value?${params}`);
     const data = await response.json();
     console.log(data);
     
     if (!response.ok) {
       throw new Error(data.error || 'Failed to fetch market value');
     }
 
     return data;
   } catch (error) {
     console.error('[Client] Error fetching market value:', error);
     return null;
   }
}

export default handler