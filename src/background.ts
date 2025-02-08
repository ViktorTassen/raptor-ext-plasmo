
// Bright Data credentials and configuration
const PROXY_HOST = "brd.superproxy.io"
const PROXY_PORT = 33335
const PROXY_USERNAME = process.env.PLASMO_PUBLIC_PROXY_USERNAME
const PROXY_PASSWORD = process.env.PLASMO_PUBLIC_PROXY_PASSWORD

// Create PAC script
const pacScript = `
  function FindProxyForURL(url, host) {
    return "PROXY ${PROXY_HOST}:${PROXY_PORT}";
  }
`

// Configure proxy settings using PAC script
const config = {
  mode: "pac_script",
  pacScript: {
    data: pacScript
  }
}

// Set up the proxy configuration
chrome.proxy.settings.set(
  { 
    value: config, 
    scope: "regular" 
  },
  () => {
    if (chrome.runtime.lastError) {
      console.error("Proxy settings error:", chrome.runtime.lastError)
    } else {
      console.log("Proxy settings updated successfully")
    }
  }
)

// Handle proxy authentication
chrome.webRequest.onAuthRequired.addListener(
  (details, callback) => {
    if (details.isProxy) {
      return { 
        authCredentials: {
          username: PROXY_USERNAME,
          password: PROXY_PASSWORD
        }
      }
    }
    return {}
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
)