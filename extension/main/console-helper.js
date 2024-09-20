(() => {
  const addApiDataProcessor = (...args) =>
    window.__consoleHelper__.addApiDataProcessor(...args);

  const tunnelMessage = (...args) =>
    window.__consoleHelper__.tunnelMessage(...args);

  const getConfig = () => window.__consoleHelper__.config;

  const getCurrentAccountId = () => {
    const raw = window.localStorage.getItem(getConfig().auths.accountIdKey);
    const match = raw?.match(/\(([^)]+)\)/);
    return match?.[1];
  };

  // send account data to extension
  addApiDataProcessor(
    (url, options) => {
      const accountId = getCurrentAccountId();
      const match = url.match(new RegExp(getConfig().auths.accountUrlMatcher));
      return (
        match &&
        match[1] === accountId &&
        (!options?.method || options?.method === "GET")
      );
    },
    async (response) => {
      if (response.status !== 200) {
        return response;
      }

      const newResponse = new Response(response);
      const data = await response.json();

      console.log("Account info captured:", data);
      tunnelMessage("ce-account-info-captured", data);

      return newResponse;
    }
  );

  const getAuthInfo = () =>
    getConfig().auths.authStateKeys.reduce(
      (ret, key) => ({
        ...ret,
        [key]: localStorage[key],
      }),
      {}
    );

  // send analyst data to extension
  addApiDataProcessor(
    (url, options) => {
      const accountId = getCurrentAccountId();
      const match = url.match(getConfig().auths.analystUrlMatcher);
      return (
        match &&
        match[1] === accountId &&
        (!options?.method || options?.method === "GET")
      );
    },
    async (response) => {
      if (response.status !== 200) {
        return response;
      }

      const newResponse = new Response(response);
      const data = await response.json();

      console.log("Analyst info captured:", data);
      tunnelMessage("ce-analyst-info-captured", {
        analyst: data,
        session: getAuthInfo(),
      });

      return newResponse;
    }
  );

  // send roles data to extension
  addApiDataProcessor(
    (url, options) => {
      const accountId = getCurrentAccountId();
      const match = url.match(getConfig().auths.rolesUrlMatcher);
      return (
        match &&
        match[1] === accountId &&
        (!options?.method || options?.method === "GET")
      );
    },
    async (response) => {
      if (response.status !== 200) {
        return response;
      }

      const newResponse = new Response(response);
      const data = await response.json();

      console.log("Roles info captured:", data);
      tunnelMessage("ce-roles-info-captured", data);

      return newResponse;
    }
  );
})();
