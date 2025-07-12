(() => {
  const addApiDataProcessor = (...args) =>
    window.__consoleHelper__.addApiDataProcessor(...args);

  const tunnelMessage = (...args) =>
    window.__consoleHelper__.tunnelMessage(...args);

  // send mixpanel tracking events
  addApiDataProcessor(
    (url, options) => {
      return (
        url.startsWith("https://api-js.mixpanel.com/track") &&
        options?.method === "POST"
      );
    },
    async (response, url, options) => {
      const data = options?.body;

      if (!data) {
        return;
      }

      const events = JSON.parse(new URLSearchParams(data).get("data"));

      console.log("Mixpanel events captured:", events);

      if (data) {
        tunnelMessage("ce-mixpanel-tracking-events-captured", events);
      }
    }
  );

  window.__consoleHelper__ = window.__consoleHelper__ || {};
})();
