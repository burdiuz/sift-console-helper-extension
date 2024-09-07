console.log("ISOLATED CONTENT SCRIPT EXECUTED!");
console.log(window.localStorage.length);

/// ----- TUNNEL MAIN <-> ISOLATED <-> BACKGROUND INIT

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

/**
 * CAN NOT evaluate scripts.
 * CAN communicate with extension via chrome.runtime.sendMessage
 * Should serve as a tunnel between content script main and extension.
 */
