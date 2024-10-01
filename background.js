// Listen for installation or update of the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or updated");
  // You can perform any initialization tasks here
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "someAction") {
    // Handle the action
    console.log("Received message:", message);
    // Perform some task based on the message
    sendResponse({ result: "Action completed" });
  }
});

chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked");
  // Execute content script in the current tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["js/content.js"],
  });
});

const processedUrls = new Set();

chrome.webRequest.onCompleted.addListener(
  async function (details) {
    if (details.url.includes(".vtt") && !processedUrls.has(details.url)) {
      try {
        const response = await fetch(details.url);
        let vttContent = await response.text();
        if (vttContent.startsWith("WEBVTT")) {
          vttContent = vttContent.replace("WEBVTT", "").trim(); // Remove the prefix and trim whitespace
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { vttContent: vttContent });
          }
        });
        processedUrls.add(details.url);
        console.log('--------------------Publishing message------------------')
      } catch (error) {
        console.error("Error fetching VTT content:", error);
      }
    }
  },
  { urls: ["https://vtt-cdn77.udemycdn.com/*"] }
);
