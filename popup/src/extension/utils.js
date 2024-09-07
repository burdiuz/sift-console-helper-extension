const { chrome } = window;

export const getActiveTab = () =>
  new Promise((resolve, reject) => {
    // tabId is added when popup opened in a browser tab
    const tabId = Number(window.location.hash.substr(1));

    if (tabId) {
      chrome.tabs.get(tabId).then(resolve).catch(reject);
      return;
    }

    // if no tabId, lookup for currently active tab
    chrome.tabs?.query(
      { active: true, currentWindow: true },
      function ([activeTab]) {
        if (!activeTab) {
          reject(new Error("Active tab could not be retrieved."));
          return;
        }

        resolve(activeTab);
      }
    );
  });

export const getTabRootUrl = (tab) => {
  const url = new URL(tab.url);
  url.hash = "";
  url.search = "";
  url.pathname = "/";

  const str = url.toString();

  return str.substring(0, str.length - 1);
};
