(() => {
  const tunnels = {};
  let tunnelIndex = 0;

  // send through tunnel
  // with async it will redirect runtime errors into promise rejection
  const tunnelMessage = async (type, data, expectResponse = false) => {
    const tunnelId = expectResponse ? `${Date.now()}-${++tunnelIndex}` : "";

    window.postMessage(
      {
        type: "ce-tunnel:outbound",
        tunnelId,
        request: { type, data },
      },
      window.location.origin
    );

    if (!expectResponse) {
      // if no response expected resolve immediately
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      tunnels[tunnelId] = { resolve, reject };
    });
  };

  window.addEventListener("message", ({ data }) => {
    if (!data || typeof data !== "object") {
      return;
    }

    // there might be empty inbound messages with no tunnedIds, ignore them
    if (
      data.type === "ce-tunnel:inbound" &&
      data.tunnelId &&
      tunnels[data.tunnelId]
    ) {
      // receive through tunnel
      /**
       * result message
       * {
       *    type: "ce-tunnel:inbound",
       *    tunnelId: "121212454534-34",
       *    action: "resolve",
       *    response: { response data }
       * }
       */
      /**
       * error message
       * {
       *    type: "ce-tunnel:inbound",
       *    tunnelId: "121212454534-34",
       *    action: "reject",
       *    response: { error object }
       * }
       */
      tunnels[data.tunnelId][data.action](data.response);
    }
  });

  window.__consoleHelper__ = window.__consoleHelper__ || {};
  window.__consoleHelper__.tunnelMessage = tunnelMessage;

  /**
   * When page reloads all content scripts also reload
   * and it is a good time to clear all cached data for this tab
   * anyway it will be re-fetched from API
   *
   * Page reloads also happen on logout, this way we will clear stale data
   */
  tunnelMessage("ce-tab-info-reset");
})();
