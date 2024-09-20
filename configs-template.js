export const go = (target, path) =>
  path.split(".").reduce((target, key) => target?.[key], target);

// Must return JSON serializable
export const getConfig = () => ({
  auths: {
    // LocalStorage key for current account id
    accountIdKey: "",
    // RegExp string for account API request
    accountUrlMatcher: "",
    // RegExp string for user/analyst API request
    analystUrlMatcher: "",
    // RegExp string for roles API request
    rolesUrlMatcher: "",
    // List of LocalStorage keys to store for authentication state
    authStateKeys: [
    ],
    // LocalStorage key for auth token
    tokenKey: "",
    // Path to property with account name, use dot-notation
    accountNamePath: "",
    // Path to property with analyst name/id etc, use dot-notation
    analystNamePath: "",
    // Time to expire, expired auths will be filtered out
    expireAfter: 86400000,
  },
  events: {
    urls: {
      // URLs for sending events, PROD is default on UI
      PROD: "",
      DEV: "",
    },
  },
  ffOverrides: {
    // LocalStorage key for feature overrides
    overridesKey: "",
    // Path to FFs container object, use dot-notation
    propertyPath: "",
  },
});
