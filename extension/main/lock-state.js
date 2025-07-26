(() => {
  window.__consoleHelper__ = window.__consoleHelper__ || {};

  const LOCKED_KEY = "_ch_lock_state_:";
  const LOCKED_STATE = "_ch_lock_state_";
  const wrapKey = (key) => `${LOCKED_KEY}${key}`;
  const isWrappedKey = (key) => typeof key === "string" && /_:.+$/.test(key);
  const unwrapKey = (key) => key.match(/_:(.+)$/)[1];

  const getItem = (target) => (key) => target[wrapKey(key)];
  const hasItem = (target) => (key) => Object.hasOwn(target, wrapKey(key));
  const setItem = (target) => (key, value) => (target[wrapKey(key)] = value);
  const removeItem = (target) => (key) => delete target[wrapKey(key)];
  const getKeys = (target) =>
    Object.keys(target).filter(isWrappedKey).map(unwrapKey);
  const getKey = (target) => (key) => {
    const index = Number.parseInt(key);
    const list = getKeys(target);

    return Number.isNaN(index) ? list[0] : list[index];
  };

  const STRING_TAG = "__Fake__Storage";
  const originalLocalStorage = window.localStorage;
  const receiverStorage = window.sessionStorage;
  const fakeStorage = new Proxy(receiverStorage, {
    get(storage, key, receiver) {
      switch (key) {
        case "length":
          return getKeys(storage).length;
        case "clear":
          getKeys(storage).forEach(removeItem(storage));
          return undefined;
        case "getItem":
          return getItem(storage);
        case "setItem":
          return setItem(storage);
        case "removeItem":
          return removeItem(storage);
        case "key":
          return getKey(storage);
        case Symbol.toStringTag:
          return STRING_TAG;
        case "toString":
        case "toLocaleString":
          return () => `[object ${STRING_TAG}]`;
        case Symbol.toPrimitive:
          return undefined;
        case "valueOf":
          return () => receiver;
        default:
          return storage[typeof key === "string" ? wrapKey(key) : key];
      }
    },
    has(storage, key) {
      return hasItem(storage)(key) || key in Object.getPrototypeOf(storage);
    },
    set(storage, key, newValue, receiver) {
      switch (key) {
        case "length":
          // read-only value, cannot overwrite
          break;
        default:
          return setItem(storage)(key, newValue);
      }
    },
    getOwnPropertyDescriptor(storage, key) {
      return Object.getOwnPropertyDescriptor(storage, wrapKey(key));
    },
    ownKeys(storage) {
      return getKeys(storage);
    },
  });

  window.__consoleHelper__.isStateLocked = () =>
    !!receiverStorage[LOCKED_STATE];

  window.__consoleHelper__.lockState = (copyOnLock) => {
    window.__consoleHelper__.unlockState = (copyOnRestore) => {
      delete receiverStorage[LOCKED_STATE];

      // set original local storage
      Object.defineProperty(window, "localStorage", {
        get: () => originalLocalStorage,
        configurable: true,
        enumerable: true,
      });

      // unreference this function
      window.__consoleHelper__.unlockState = null;

      // copy values stored in receiver storage to local storage
      Object.entries(fakeStorage).forEach(([key, value]) => {
        if (copyOnRestore) {
          originalLocalStorage[key] = value;
        }

        // delete values from receiver storage
        delete receiverStorage[wrapKey(key)];
      });
    };

    Object.defineProperty(window, "localStorage", {
      get: () => fakeStorage,
      configurable: true,
      enumerable: true,
    });

    // copy values from local storage to receiver storage
    if (copyOnLock) {
      Object.entries(originalLocalStorage).forEach(([key, value]) => {
        fakeStorage[key] = value;
        /*
         * In case if app stored a reference to original local storage,
         * we want values them to be undefined instead of serving outdated values.
         */
        // TODO this is rather an edge case, not sure if this should be kept
        delete originalLocalStorage[key];
      });
    }

    receiverStorage[LOCKED_STATE] = copyOnLock ? "1" : "0";
  };

  // check if local storage is locked and apply lock again on page load
  if (receiverStorage[LOCKED_STATE]) {
    // delete locked key to prevent it leaking to fake storage
    // it will be reapplied on lockState()
    delete receiverStorage[LOCKED_STATE];

    // we don't need to copy LocalStorage content again on setting up lock again
    // everything we need was copied on initial setup. copying data again may polute app state.
    window.__consoleHelper__.lockState();
  }
})();
