import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.url.includes('turo.com') && details.url.includes('search?country')) {
      try {
        const url = new URL(details.url)
        const searchParams = {
          startDate: url.searchParams.get("startDate"),
          startTime: url.searchParams.get("startTime"),
          endDate: url.searchParams.get("endDate"),
          endTime: url.searchParams.get("endTime")
        }

        if (searchParams.startDate && searchParams.endDate) {
          console.log('[Raptor] Search params intercepted:', searchParams)
          // Store params asynchronously without awaiting
          storage.set("searchParams", searchParams).catch(error => {
            console.error('[Raptor] Error saving search params:', error)
          })
        }
      } catch (error) {
        console.error('[Raptor] Error processing URL:', error)
      }
    }
    return {}
  },
  { urls: ["*://*.turo.com/*"] }
)