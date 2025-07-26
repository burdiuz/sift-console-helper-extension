(async () => {
  const url = chrome.runtime.getURL("./config.json");
  let config = null;

  try {
    config = await fetch(url).then((response) => response.json());
  } catch (error) {
    throw new Error("Config file is missing or a corrupt JSON file.");
  }

  window.postMessage({
    type: "ce-config-propagation",
    config,
  });
})();
