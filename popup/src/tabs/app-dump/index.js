import { useCallback, useEffect, useState } from "react";
import { List } from "./List";
import { AppDumpEditor } from "./AppDumpEditor";
import { getActiveTab, getTabRootUrl } from "extension/utils";
import { useSnackbars } from "shared/Snackbars";
import { getStorageItem, setStorageItem } from "extension/storage";

const { chrome } = window;

const STORAGE_KEY = "ce-app-state-dump";

export const dumpAppState = (
  tab,
  { hasCookies, hasLocalStorage, hasSessionStorage }
) =>
  new Promise((resolve, reject) => {
    function injectedFn(dumpLS, dumpSS, dumpCk) {
      return {
        localStorage: dumpLS ? { ...window.localStorage } : undefined,
        sessionStorage: dumpSS ? { ...window.sessionStorage } : undefined,
        cookies: dumpCk
          ? (window.document.cookie || "").split(";").reduce((res, str) => {
              const [key, value] = str.trim().split("=");

              return {
                ...res,
                [key]: value,
              };
            }, {})
          : undefined,
      };
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
        args: [hasLocalStorage, hasSessionStorage, hasCookies],
      })
      .then(([{ result }]) => resolve(result))
      .catch(reject);
  });

export const clearAppState = (
  tab,
  { hasCookies, hasLocalStorage, hasSessionStorage }
) =>
  new Promise((resolve, reject) => {
    function injectedFn(clearLS, clearSS, clearCk) {
      if (clearLS) {
        window.localStorage.clear();
      }

      if (clearSS) {
        window.sessionStorage.clear();
      }

      if (clearCk) {
        const { document } = window;
        const hosts = [window.location.host, `.${window.location.host}`];
        const paths = ["/", window.location.pathname];
        (document.cookie || "").split(";").forEach((item) => {
          const [key] = item.trim().split("=");
          const base = `${key}=;expires=${new Date(
            2000
          ).toUTCString()};max-age=-1`;

          hosts.forEach((host) => {
            paths.forEach((path) => {
              const str = `${base};path=${path};domain=${host}`;
              document.cookie = str;
              document.cookie = `${str};secure`;
            });
          });
        });
      }
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
        args: [hasLocalStorage, hasSessionStorage, hasCookies],
      })
      .then(([{ result }]) => resolve(result))
      .catch(reject);
  });

export const applyAppState = (
  tab,
  item,
  { hasCookies, hasLocalStorage, hasSessionStorage }
) =>
  new Promise((resolve, reject) => {
    function injectedFn(item, applyLS, applySS, applyCk) {
      if (item.localStorage && applyLS) {
        Object.entries(item.localStorage).forEach(([key, value]) =>
          window.localStorage.setItem(key, value)
        );
      }

      if (item.sessionStorage && applySS) {
        Object.entries(item.sessionStorage).forEach(([key, value]) =>
          window.sessionStorage.setItem(key, value)
        );
      }

      if (item.cookies && applyCk) {
        const { document } = window;
        const domain = `;domain=${
          item.cookieDomain || `.${window.location.host}`
        }`;
        const maxAge = item.cookieMaxAge ? `;max-age=${item.cookieMaxAge}` : "";
        const expires = item.cookieExpirationDate
          ? `;expires=${item.cookieExpirationDate}`
          : "";
        const path = `;path=${item.cookiePath || "/"}`;
        const secure = item.cookieSecure ? ";secure" : "";

        Object.entries(item.cookies).forEach(
          ([key, value]) =>
            (document.cookie = `${key}=${value}${domain}${path}${maxAge}${expires}${secure}`)
        );
      }
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
        args: [item, hasLocalStorage, hasSessionStorage, hasCookies],
      })
      .then(([{ result }]) => resolve(result))
      .catch(reject);
  });

export const AppDumpView = () => {
  const [list, setList] = useState([]);
  const [editedItem, setEditedItem] = useState(null);
  const { showSnackbar } = useSnackbars();

  const reloadList = useCallback(async () => {
    const list = await getStorageItem(STORAGE_KEY);

    setList(list || []);
  }, []);

  const handleDump = useCallback(async (item) => {
    const { description } = item;
    const tab = await getActiveTab();
    const storages = await dumpAppState(tab, item);
    const host = getTabRootUrl(tab);
    const date = Date.now();
    const list = (await getStorageItem(STORAGE_KEY)) || [];
    await setStorageItem(STORAGE_KEY, [
      {
        ...storages,
        id: date,
        name: host,
        description,
        cookieMaxAge: "",
        cookieExpirationDate: "",
        cookiePath: "/",
        cookieDomain: "",
        cookieSecure: true,
        date,
      },
      ...list,
    ]);

    reloadList();
  }, []);

  const handleEdit = useCallback((item) => {
    setEditedItem(item);
  }, []);

  const handleRemove = useCallback(async (id) => {
    const list = await getStorageItem(STORAGE_KEY);

    await setStorageItem(
      STORAGE_KEY,
      list.filter((item) => item.id !== id)
    );

    reloadList();
  }, []);

  const handleMerge = useCallback(async (item, options) => {
    const tab = await getActiveTab();
    await applyAppState(tab, item, options);
    showSnackbar("Application state has been merged.");
  }, []);

  const handleReplace = useCallback(async (item, options) => {
    const tab = await getActiveTab();
    await clearAppState(tab, options);
    await applyAppState(tab, item, options);
    showSnackbar("Application state has been replaced.");
  }, []);

  const handleEditorSave = useCallback(async (updatedItem) => {
    const list = await getStorageItem(STORAGE_KEY);
    await setStorageItem(
      STORAGE_KEY,
      list.map((item) => {
        if (item.id !== updatedItem.id) {
          return item;
        }

        return updatedItem;
      })
    );

    reloadList();
    setEditedItem(null);
  }, []);

  const handleEditorClose = useCallback(() => {
    setEditedItem(null);
  }, []);

  useEffect(() => {
    reloadList();
  }, []);

  return editedItem ? (
    <AppDumpEditor
      value={editedItem}
      onSave={handleEditorSave}
      onClose={handleEditorClose}
    />
  ) : (
    <List
      dumps={list}
      onDump={handleDump}
      onEdit={handleEdit}
      onRemove={handleRemove}
      onMerge={handleMerge}
      onReplace={handleReplace}
    />
  );
};
