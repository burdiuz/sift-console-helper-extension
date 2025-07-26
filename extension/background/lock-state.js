export const isTabLocked = async (tabId) => {
  try {
    const data = await chrome.scripting.executeScript({
      target: { tabId },
      func: function () {
        return window.__consoleHelper__.isStateLocked();
      },
      args: [],
      injectImmediately: true,
      world: "MAIN",
    });

    return data[0].result;
  } catch (error) {
    console.error(error);
  }

  return false;
};

export const lockStateForTheTab = async (tabId, copyContent) => {
  function injectedFn(copyContent) {
    if (!window.__consoleHelper__.unlockState) {
      window.__consoleHelper__.lockState(copyContent);
    }
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectedFn,
      args: [copyContent],
      injectImmediately: true,
      world: "MAIN",
    });
  } catch (error) {
    console.error(error);
  }
};

export const unlockStateForTheTab = async (tabId, copyContent) => {
  function injectedFn(copyContent) {
    window.__consoleHelper__.unlockState?.(copyContent);
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectedFn,
      args: [copyContent],
      injectImmediately: true,
      world: "MAIN",
    });
  } catch (error) {
    console.error(error);
  }
};

export const toggleLockStateForTheTab = async (
  tabId,
  { copyOnRestore, copyOnLock },
  callback
) => {
  const locked = await isTabLocked(tabId);

  if (locked) {
    await unlockStateForTheTab(tabId, copyOnRestore);
  } else {
    await lockStateForTheTab(tabId, copyOnLock);
  }

  const newLockedValue = await isTabLocked(tabId);

  // locking/unlocking might throw an error and fail to apply the change,
  // so we retrieve fresh locked state value.
  callback(newLockedValue);
};
