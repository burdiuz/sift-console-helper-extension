export const go = (target, path) =>
  path.split(".").reduce((target, key) => target?.[key], target);

let config = null;

/**
 * Should be called from background script, then config
 * can be propagated to other parts of extension
 */
export const readConfigFromFile = async () => {
  const url = chrome.runtime.getURL("./config.json");
  let data = null;

  try {
    data = await fetch(url).then((response) => response.json());
  } catch (error) {
    throw new Error("Config file is missing or a corrupt JSON file.");
  }
  config = data;
  console.log("Extension config loaded.");

  return data;
};

export const getConfig = () => config;

export const sendConfigToTheTab = (tabId) => {
  function injectedFn(config) {
    window.__consoleHelper__ = window.__consoleHelper__ || {};
    window.__consoleHelper__.config = config;
    console.log('Console Helper config installed.');
  }

  chrome.scripting
    .executeScript({
      target: { tabId },
      func: injectedFn,
      args: [getConfig()],
      injectImmediately: true,
      world: "MAIN",
    })
    .catch(console.error);
};
