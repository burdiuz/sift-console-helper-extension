import {
  go,
  getConfig,
  readConfigFromFile,
  sendConfigToTheTab,
} from "./background/configs.js";
import {
  isTabLocked,
  toggleLockStateForTheTab,
} from "./background/lock-state.js";

const accounts = {};
const analysts = {};
const roles = {};
const mixpanel = {};

const clearCapturedData = (tabId) => {
  delete accounts[tabId];
  delete analysts[tabId];
  delete roles[tabId];
  delete mixpanel[tabId];
};

const getTabRootUrl = (tab) => {
  const url = new URL(tab.url);
  url.hash = "";
  url.search = "";
  url.pathname = "/";

  const str = url.toString();

  return str.substring(0, str.length - 1);
};

const getStorageItem = (key) =>
  chrome.storage.local.get().then((data) => data[key]);

const setStorageItem = (key, value) =>
  chrome.storage.local
    .get()
    .then((data) => chrome.storage.local.set({ ...data, [key]: value }));

chrome.tabs.onRemoved.addListener((tabId) => {
  clearCapturedData(tabId);
});

const storeAuthSession = async (tab, session, analyst) => {
  const {
    auths: { tokenKey, analystNamePath },
  } = getConfig();

  const list = await getStorageItem("app-auth-sessions");

  const exists = list?.some(({ data }) => data[tokenKey] === session[tokenKey]);

  if (exists) {
    return;
  }

  const date = Date.now();

  const item = {
    id: date,
    name: `${getTabRootUrl(tab)} / ${go(analyst, analystNamePath)}`,
    data: session,
    date,
    auto: true,
  };

  setStorageItem("app-auth-sessions", [item, ...(list || [])]);
};

/**
 * Receiver for messages from content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (typeof request !== "object" && !request?.type) {
    // ignore malformed messages
    return;
  }

  console.log("onMessage:", request, sender);

  // filter out requests from extension popup
  if (/^chrome-extension:\/\//.test(sender.origin) || !sender.tab) {
    // ignore requests not from tabs
    return;
  }

  const { type, data } = request;
  const tabId = sender.tab.id;

  switch (type) {
    case "ce-tab-info-reset":
      clearCapturedData(tabId);

      // replaced by config loader
      // sendConfigToTheTab(tabId);
      break;
    case "ce-account-info-captured":
      accounts[tabId] = data;
      break;
    case "ce-analyst-info-captured":
      const { analyst, session } = data;
      analysts[tabId] = analyst;
      storeAuthSession(sender.tab, session, analyst);
      break;
    case "ce-roles-info-captured":
      roles[tabId] = data;
      break;
    case "ce-mixpanel-tracking-events-captured":
      if (!mixpanel[tabId]) {
        mixpanel[tabId] = [];
      }

      // add new events to the list
      mixpanel[tabId].push(...data);

      // reduce list size to 25 only
      mixpanel[tabId] = mixpanel[tabId].slice(-25);

      chrome.runtime.sendMessage({
        type: "mixpanel-event-list-updated",
        tabId,
        data: mixpanel[tabId],
      });
      break;
    case "ce-auth-info-auto-fill":
      break;
  }

  // Not calling with empty response causes runtime error if other party expects answer
  // Unchecked runtime.lastError: The message port closed before a response was received.
  try {
    sendResponse();
  } catch (err) {
    console.error(err);
  }
});

/**
 * Receiver for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (typeof request !== "object" && !request?.type) {
    // ignore malformed messages
    return;
  }

  // filter out requests from an app, pass only popup requests
  if (!/^chrome-extension:\/\//.test(sender.origin)) {
    // ignore requests from tabs
    return;
  }

  const { type, tabId } = request;

  console.log("message:", type);

  switch (type) {
    case "get-config-data":
      sendResponse(getConfig());
      break;
    case "get-account-info":
      sendResponse(accounts[tabId]);
      break;
    case "get-analyst-info":
      sendResponse(analysts[tabId]);
      break;
    case "get-roles-info":
      sendResponse(roles[tabId]);
      break;
    case "get-mixpanel-tracking-events-info":
      sendResponse(mixpanel[tabId]);
      break;
    case "get-tab-lock-state":
      isTabLocked(tabId).then((locked) => sendResponse({ tabId, locked }));
      return true;
    case "toggle-tab-lock":
      toggleLockStateForTheTab(tabId, request, (locked) =>
        sendResponse({ tabId, locked })
      );
      return true;
  }
});

/**
 * Each time script starts we should read the config file
 */
readConfigFromFile();
