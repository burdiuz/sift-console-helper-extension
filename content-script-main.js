console.log("MAIN CONTENT SCRIPT EXECUTED!");
console.log(window.localStorage.length);

/// ----- TUNNEL MAIN <-> ISOLATED INIT
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

/// ----- PROCESSORS INIT

const apiDataProcessors = new Map();

const addApiDataProcessor = (comparatorFn, processorFn) =>
  apiDataProcessors.set(comparatorFn, processorFn);

const processApiData = async (url, options, response, xmlHttpRequest) => {
  for (let [comparator, processor] of apiDataProcessors) {
    try {
      if (comparator(url, options)) {
        await processor(response, url, options, xmlHttpRequest);
      }
    } catch (error) {
      console.error("CE API Data Processor failure.");
      console.error(error);
    }
  }
};

/// ----- BASE PROCESSORS

// -------- XmlHttpRequest INIT

const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

const DATA_KEY = Symbol("ce-data");

XMLHttpRequest.prototype.open = function (method, url, ...args) {
  this[DATA_KEY] = { method, url };
  return originalOpen.apply(this, [method, url, ...args]);
};
XMLHttpRequest.prototype.send = function (data, ...args) {
  this[DATA_KEY].body = data;

  Promise.resolve().then(() => {
    this.addEventListener("loadend", () => {
      const { url, method, body } = this[DATA_KEY] || {};

      /*
        Decided not to add response stub here to make 
        it clear that XmlHttpRequest is being handled.

        {
          json: () => Promise.resolve(this.response),
        }
      */
      // TODO Pause XmlHttpReuqest until changes applied?
      processApiData(url, { method, body }, null, this);
    });
  });

  return originalSend.apply(this, [data, ...args]);
};

// -------- FETCH INIT

(() => {
  const originalFetch = window.fetch;
  window.fetch = (url, options, ...args) =>
    originalFetch(url, options, ...args).then(async (response) => {
      await processApiData(url, options, response, null);
      return response;
    });
})();

// --- SETUP SCRIPT
/**
 * Clear all tab data when page reloads
 */
tunnelMessage("ce-tab-info-reset");

/**
 * CAN NOT evaluate scripts.
 * CAN NOT communicate with extension.
 * CAN communicate with isolated part of content script via window.postMessage()
 * To communicate with extension use window.postMessage to send message to isolated part
 * of the script which will communicate.
 * TRY "externally_connectable" to communicate directly with extension from MAIN script
 * https://developer.chrome.com/docs/extensions/develop/concepts/messaging
 *
 * https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#host-page-communication
 */
console.log("MAIN:", chrome.runtime);

// TODO use window.postMessage() to tunnel messages through isolated content script to extension and back
/*
const httpInspector = chrome.runtime.connect({ name: "http-api-inspect" });
httpInspector.onMessage.addEventListener(({ type, data }) => {
  switch (type) {
    case "rules":
      break;
    case "request-continue":
      break;
    case "response-continue":
      break;
  }
});

console.log("Inspector PORT:", httpInspector);
*/
// eval('(function () { console.log("MAIN Hello World!");})()');
