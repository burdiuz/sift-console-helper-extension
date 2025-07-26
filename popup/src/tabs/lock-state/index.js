import { Typography } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import { useCallback, useEffect, useState } from "react";

const { chrome } = window;

/**
 * Use local storage replacemenet to isolate state changes for the current tab.
 * Save values into a session storage, prepend keys with `_ch_lock_state_:${key}`.
 */
export const LockStateView = ({ tabId }) => {
  const [locked, setLocked] = useState(false);
  const [copyOnRestore, setCopyOnRestore] = useState(false);
  const [copyOnLock, setCopyOnLock] = useState(false);

  useEffect(() => {
    // determine if tab is locked
    chrome.runtime.sendMessage(
      { type: "get-tab-lock-state", tabId },
      ({ locked }) => setLocked(locked)
    );
  }, []);

  const handleToggleLock = () => {
    chrome.runtime.sendMessage(
      { type: "toggle-tab-lock", tabId, copyOnRestore, copyOnLock },
      ({ locked }) => setLocked(locked)
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Typography>
        Locking LocalStorage replaces it with a proxy which redirects all
        get/set requests to SessionStorage. This isolates LocalStorage changes
        from other tabs in same origin. LocalStorage lock lasts until tab or
        browser closed and applied to any origin opened in the locked tab.
      </Typography>
      {locked ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Checkbox
            label="Keep current LocalStorage content"
            checked={copyOnRestore}
            onChange={() => setCopyOnRestore(!copyOnRestore)}
          />
          <Button
            color="danger"
            onClick={handleToggleLock}
            sx={{ alignSelf: "flex-end" }}
          >
            Release LocalStorage for current Tab
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Checkbox
            label="Move current LocalStorage content"
            checked={copyOnLock}
            onChange={() => setCopyOnLock(!copyOnLock)}
          />
          <Button color="primary" onClick={handleToggleLock}>
            Lock LocalStorage for current Tab
          </Button>
        </Box>
      )}
    </Box>
  );
};
