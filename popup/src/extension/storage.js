const { chrome } = window;

export const getStorage = () => chrome.storage?.local;

export const getStorageItem = (key) =>
  chrome.storage?.local.get().then((data) => data[key]);

export const setStorageItem = (key, value) =>
  chrome.storage?.local
    .get()
    .then((data) => chrome.storage.local.set({ ...data, [key]: value }));
