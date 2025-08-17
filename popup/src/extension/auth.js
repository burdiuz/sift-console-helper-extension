import { getActiveTab } from "./utils";

const { chrome } = window;

export const dumpAuthSession = (tab, authStateKeys) =>
  new Promise((resolve, reject) => {
    function injectedFn(keys) {
      return keys.reduce(
        (ret, key) => ({
          ...ret,
          [key]: localStorage[key],
        }),
        {}
      );
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
        args: [authStateKeys],
      })
      .then(([{ result }]) => resolve(result))
      .catch(reject);
  });

export const applyAuthSessionDump = (tab, data) =>
  new Promise((resolve, reject) => {
    function injectedFn(data) {
      Object.entries(data).forEach(([key, value]) =>
        localStorage.setItem(key, value)
      );

      window.location.reload();
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
        args: [data],
        // If tab is locked, will use *locked* localStorage
        // In ISOLATED world it would be original localStorage
        world: "MAIN",
      })
      .then(() => resolve())
      .catch(reject);
  });

export const getAccountInfo = (tab) =>
  new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { type: "get-account-info", tabId: tab.id },
        resolve
      );
    } catch (error) {
      reject(error);
    }
  });

export const getAccountForActiveTab = () => getActiveTab().then(getAccountInfo);

export const getAnalystInfo = (tab) =>
  new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { type: "get-analyst-info", tabId: tab.id },
        resolve
      );
    } catch (error) {
      reject(error);
    }
  });

export const getAnalystForActiveTab = () => getActiveTab().then(getAnalystInfo);

export const getRolesInfo = (tab) =>
  new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { type: "get-roles-info", tabId: tab.id },
        resolve
      );
    } catch (error) {
      reject(error);
    }
  });

export const getRolesForActiveTab = () => getActiveTab().then(getRolesInfo);
