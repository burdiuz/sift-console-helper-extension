(() => {
  let unlockState;

  const wrapKey = (key) => `_ch_lock_state_:${key}`;
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

  const lockState = () => {
    unlockState = () => {
      // set original local storage
      Object.defineProperty(window, "localStorage", {
        get: () => originalLocalStorage,
        configurable: true,
        enumerable: true,
      });

      // unreference this function
      unlockState = null;

      // copy values stored in receiver storage to local storage
      Object.entries(fakeStorage).forEach(([key, value]) => {
        originalLocalStorage[key] = value;
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
    Object.entries(originalLocalStorage).forEach(([key, value]) => {
      fakeStorage[key] = value;
      /*
       * In case if app stored a reference to original local storage,
       * we want values them to be undefined instead of serving outdated values.
       */
      delete originalLocalStorage[key];
    });
  };

  window.addEventListener("message", ({ data }) => {
    if (!data || typeof data !== "object") {
      return;
    }

    if (data.type === "ce-lock-state:tab-enable" && !unlockState) {
      lockState();
    }

    if (data.type === "ce-lock-state:tab-disable" && unlockState) {
      unlockState();
    }
  });
})();
