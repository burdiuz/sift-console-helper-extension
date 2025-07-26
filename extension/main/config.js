(() => {
  window.__consoleHelper__ = window.__consoleHelper__ || {};

  function configMessageHandler({ data }) {
    if (!data || typeof data !== "object") {
      return;
    }

    if (data.type !== "ce-config-propagation" || !data.config) {
      return;
    }

    window.__consoleHelper__.config = data.config;
    console.log("Console Helper config installed.");
  }
  window.addEventListener("message", configMessageHandler);
})();
