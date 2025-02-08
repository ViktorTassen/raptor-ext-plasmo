const BRIGHT_DATA_USERNAME = "brd-customer-hl_581f5b31-zone-datacenter_proxy1" // Your Bright Data username
const BRIGHT_DATA_PASSWORD = "y2zb42a0desr" // Your Bright Data password
const ZONE = "datacenter_proxy1" // The zone you want to use


// Add domains that should use the proxy
const PROXY_DOMAINS = [
  "turo.com",
  "api.example.com"
  // Add more domains as needed
]

// Configure proxy settings
const config = {
  mode: "fixed_servers",
  rules: {
    singleProxy: {
      scheme: "http",
      host: `brd.superproxy.io:33335`,
      port: 20000
    },
    bypassList: []
  }
}

// Set up the proxy configuration using chrome.proxy API
chrome.proxy.settings.set(
  { value: config, scope: "regular" },
  () => {
    console.log("Proxy settings updated")
  }
)

// Set up proxy authentication
chrome.webRequest.onAuthRequired.addListener(
  (details, callback) => {
    callback({
      authCredentials: {
        username: BRIGHT_DATA_USERNAME,
        password: BRIGHT_DATA_PASSWORD
      }
    })
  },
  { urls: PROXY_DOMAINS.map(domain => `*://*.${domain}/*`) }
)