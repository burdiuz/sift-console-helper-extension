const tabData = {};

const clearCapturedData = (tabId) => {
  delete tabData[tabId];
};

chrome.tabs.onRemoved.addListener((tabId) => {
  clearCapturedData(tabId);
});

/**
 * Receiver for messages from content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (typeof request !== "object" && !request?.type) {
    // ignore malformed messages
    return;
  }

  if (!sender.tab) {
    // ignore requests not from tabs
    return;
  }

  const { type, data } = request;
  const tabId = sender.tab.id;

  switch (type) {
    case "ce-tab-info-reset":
      clearCapturedData(tabId);
      break;
    case "ce-tab-data-captured":
      tabData[tabId] = data;

      chrome.runtime.sendMessage({
        type: "ce-tab-data-updated",
        tabId,
        data: tabData[tabId],
      });
      break;
  }

  // Not calling with empty response causes runtime error
  // Unchecked runtime.lastError: The message port closed before a response was received.
  sendResponse();

  console.log("onMessage:", request, sender);
});

/**
 * Receiver for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (typeof request !== "object" && !request?.type) {
    // ignore malformed messages
    return;
  }

  if (sender.tab) {
    // ignore requests from tabs
    return;
  }

  const { type, tabId } = request;

  switch (type) {
    case "get-tab-data-info":
      sendResponse(tabData[tabId]);
      break;
  }

  console.log("onMessage:", request, sender);
});

/*
console.log(chrome.runtime.id, chrome.tabs);
console.log(chrome.extension);
console.log(chrome.runtime);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("chrome.tabs.onUpdated:", tabId, changeInfo, tab);
});
*/
