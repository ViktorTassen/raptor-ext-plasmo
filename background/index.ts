import { Storage } from "@plasmohq/storage"
import RaptorDB from "~db"

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

// Initialize database in background script
export const db = new RaptorDB()

// Handle database initialization
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[Raptor] Extension installed, initializing database')
    try {
      await db.initialize()
    } catch (error) {
      console.error('[Raptor] Failed to initialize database on install:', error)
    }
  } else {
    // For updates and other cases, just ensure the database is open
    await db.ensureOpen().catch(error => {
      console.error('[Raptor] Error ensuring database is open:', error)
    })
  }
})

// Keep database open during browser startup
chrome.runtime.onStartup.addListener(async () => {
  try {
    await db.ensureOpen()
  } catch (error) {
    console.error('[Raptor] Error ensuring database is open on startup:', error)
  }
})

// Clean up on uninstall
chrome.runtime.setUninstallURL("", () => {
  db.delete().then(() => {
    console.log('[Raptor] Database deleted successfully')
  }).catch(error => {
    console.error('[Raptor] Error deleting database:', error)
  })
})