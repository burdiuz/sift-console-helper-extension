/**
 * Portion of message tunnel between main content script and background script(service worker)
 */
window.addEventListener("message", ({ data }) => {
  if (!data || typeof data !== "object") {
    return;
  }

  if (data.type === "ce-tunnel:outbound") {
    const { tunnelId, request } = data;

    if (!tunnelId) {
      chrome.runtime.sendMessage(request);
      return;
    }

    chrome.runtime.sendMessage(request, (response) => {
      window.postMessage({
        type: "ce-tunnel:inbound",
        tunnelId,
        // for now support only resolving requests
        action: "resolve",
        response,
      });
    });
  }
});
