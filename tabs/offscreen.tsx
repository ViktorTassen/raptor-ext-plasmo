const HOSTING_URL = "https://raptor3-web.vercel.app/sign-in-popup";

const iframe = document.createElement('iframe');
iframe.src = HOSTING_URL;
document.body.appendChild(iframe);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getAuth' && message.target === 'offscreen') {
        function handleIframeMessage({data}) {
            try {
                if (data.startsWith('!_{')) {
                    // Other parts of the Firebase library send messages using postMessage.
                    // You don't care about them in this context, so return early.
                    return;
                  }
                console.log("data", data);
                const parsedData = JSON.parse(data);
                window.removeEventListener('message', handleIframeMessage);
                sendResponse(parsedData.user);
            } catch (e) {
                console.error('Error parsing iframe message:', e);
            }
        }

        window.addEventListener('message', handleIframeMessage);
        iframe.contentWindow.postMessage({initAuth: true}, HOSTING_URL);
        return true; // Indicates we will send a response asynchronously


    }
});

function Offscreen() {
    return (
            <div>offscreen</div>
    )

}


export default Offscreen;





