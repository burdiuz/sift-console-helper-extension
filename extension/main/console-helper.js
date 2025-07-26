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

  const isValidAPIRequest = (rgxFn) => (url, options) => {
    let accountId = getCurrentAccountId();
    const match = url.match(rgxFn());

    const valid = match && (!options?.method || options?.method === "GET");

    if (accountId) {
      return valid && accountId === match[1];
    } else if (!accountId && match?.[1]) {
      // if not available in LS, we lookup for it in URL
      accountId = match[1];
    }

    return valid;
  };

  // send account data to extension
  addApiDataProcessor(
    isValidAPIRequest(() => new RegExp(getConfig().auths.accountUrlMatcher)),
    async (response) => {
      if (response.status !== 200) {
        return response;
      }

      const data = await response.clone().json();

      console.log("Account info captured:", data);
      tunnelMessage("ce-account-info-captured", data);

      return response;
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
    isValidAPIRequest(() => new RegExp(getConfig().auths.analystUrlMatcher)),
    async (response) => {
      if (response.status !== 200) {
        return response;
      }

      const data = await response.clone().json();

      console.log("Analyst info captured:", data);
      tunnelMessage("ce-analyst-info-captured", {
        analyst: data,
        session: getAuthInfo(),
      });

      return response;
    }
  );

  // send roles data to extension
  addApiDataProcessor(
    isValidAPIRequest(() => new RegExp(getConfig().auths.rolesUrlMatcher)),
    async (response) => {
      if (response.status !== 200) {
        return response;
      }

      const data = await response.clone().json();

      console.log("Roles info captured:", data);
      tunnelMessage("ce-roles-info-captured", data);

      return response;
    }
  );
})();
