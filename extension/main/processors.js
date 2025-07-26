(() => {
  const apiDataProcessors = new Map();

  const addApiDataProcessor = (comparatorFn, processorFn) =>
    apiDataProcessors.set(comparatorFn, processorFn);

  const processApiData = async (url, options, response, xmlHttpRequest) => {
    for (let [comparator, processor] of apiDataProcessors) {
      try {
        if (
          (url instanceof Request && comparator(url.url, url)) ||
          (!(url instanceof Request) && comparator(String(url), options))
        ) {
          await processor(response, url, options, xmlHttpRequest);
        }
      } catch (error) {
        console.error("CE API Data Processor failure.");
        console.error(error);
      }
    }
  };

  window.__consoleHelper__ = window.__consoleHelper__ || {};
  window.__consoleHelper__.processApiData = processApiData;
  window.__consoleHelper__.addApiDataProcessor = addApiDataProcessor;
})();
