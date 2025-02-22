import { Storage } from "@plasmohq/storage"
import RaptorDB from "~db"
declare const self: ServiceWorkerGlobalScope;


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

// // Clean up on uninstall
// chrome.runtime.setUninstallURL("", () => {
//   db.delete().then(() => {
//     console.log('[Raptor] Database deleted successfully')
//   }).catch(error => {
//     console.error('[Raptor] Error deleting database:', error)
//   })
// })


const OFFSCREEN_DOCUMENT_PATH = 'tabs/offscreen.html';
import { authenticateWithFirebase } from "~firebase/firebaseClient"

let creatingOffscreenDocument;

async function hasOffscreenDocument() {
  const matchedClients = await self.clients.matchAll()
    return matchedClients.some(
        (c) => c.url === chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
    )
}

async function setupOffscreenDocument() {
    if (await hasOffscreenDocument()) return;

    if (creatingOffscreenDocument) {
        await creatingOffscreenDocument;
    } else {
        creatingOffscreenDocument = chrome.offscreen.createDocument({
            url: chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
            reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
            justification: 'Firebase Authentication'
        });
        await creatingOffscreenDocument;
        creatingOffscreenDocument = null;
    }
}

async function getAuthFromOffscreen() {
    await setupOffscreenDocument();
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'getAuth', target: 'offscreen' }, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "signIn") {
        getAuthFromOffscreen()
            .then(async (user: { uid: string, email: string, displayName: string }) => {
                const minimalUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                }
                console.log("User signed in:", user)
                // Authenticate Firebase with the access token
                if (user.uid) {
                    await authenticateWithFirebase(user.uid)
                }

                await storage.set("user", minimalUser) // Store only necessary fields
                sendResponse({ user: user })
            })
            .catch(error => {
                console.error("Authentication error:", error)
                sendResponse({ error: error.message })
            })
        return true // Keeps the message channel open for async response
    }

})



chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed or updated:', details);
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        console.log('This is a new installation.');
        chrome.tabs.create({ url: "tabs/welcome.html" });
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        console.log('Extension updated from version', details.previousVersion);
    }
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        tab.url.startsWith("https://accounts.google.com/o/oauth2/auth/") ||
        tab.url.startsWith("https://<firebase-project-id>.firebaseapp.com")
    ) {
        chrome.windows.update(tab.windowId, { focused: true })
        return
    }
})