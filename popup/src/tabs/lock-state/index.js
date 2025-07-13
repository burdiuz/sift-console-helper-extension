import { Box } from "@mui/joy";
import { useCallback, useState } from "react";

/**
 * Use local storage replacemenet to isolate state changes for the current tab.
 * Save values into a session storage, prepend keys with `_ch_lock_state_:${key}`.
 */
export const LockStateView = () => {
  const [list, setList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSaveSelectedItem = useCallback((item) => {});

  return <Box sx={{ display: "flex", flexDirection: "column" }}></Box>;
};
