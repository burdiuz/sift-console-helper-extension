(() => {
  const processApiData = (...args) =>
    window.__consoleHelper__.processApiData(...args);

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
        processApiData(url, { method, body }, null, this);
      });
    });

    return originalSend.apply(this, [data, ...args]);
  };

  // -------- FETCH INIT
  let Authorization;
  const originalFetch = window.fetch;
  window.fetch = (url, options, ...args) => {
    // FIXME will not work when API requests are sent using absolute URL
    if (url.match(/^\//)) {
      const auth =
        options?.headers instanceof Headers
          ? options.headers.get("Authorization")
          : options?.headers?.["Authorization"];

      Authorization = auth || Authorization;
    }

    return originalFetch(url, options, ...args).then(async (response) => {
      const newResponse = await processApiData(url, options, response, null);
      return newResponse || response;
    });
  };

  let fetchAuthUsed = false;

  /**
   * Same fetch() but with injected Authorization HTTP header to make API calls from browser DevTools console.
   * @param {string} url
   * @param {object} options
   * @param  {...any} args
   * @returns {Promise<Response>}
   */
  window.fetchAuth = (url, options, ...args) => {
    if (!fetchAuthUsed) {
      console.warn(
        "Keep in mind that fetchAuth() works only when Chrome Extension is installed and enabled, and you are logged into the Sift Console."
      );
      fetchAuthUsed = true;
    }
    if (!options) options = {};
    if (!options.headers) options.headers = {};

    if (options.headers instanceof Headers) {
      options.headers.set("Authorization", Authorization);
    } else {
      options.headers["Authorization"] = Authorization;
    }

    return window.fetch(url, options, ...args);
  };
})();
