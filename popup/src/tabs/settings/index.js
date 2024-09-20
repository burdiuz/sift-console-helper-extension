/** TODO
 * Add here possibility to upload env settings
 * Add a button to copy settings template JSON
 * Possibly more settings here
 *
 * Add a screen on first time open with user agreement and
 * a button to upload settings
 *
 * If settings do not exist in storage this should be default tab for popup
 */

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { CopyToClipboardButton } from "shared/CopyToClipboardButton";
import { ConfirmationText } from "./ConfirmationText";
import { useEffect, useMemo, useState } from "react";
import { Textarea, Typography } from "@mui/joy";
import { useSnackbars } from "shared/Snackbars";

const { chrome } = window;

export const SettingsView = () => {
  const { showSnackbar } = useSnackbars();
  const [data, setData] = useState({});
  const [jsonText, setJsonText] = useState("");

  const isValidJson = useMemo(() => {
    try {
      const json = JSON.parse(jsonText);
      return !!json;
    } catch (err) {
      return false;
    }
  }, [jsonText]);

  const handleImport = async () => {
    const newData = JSON.parse(jsonText);

    await chrome.storage?.local.set(newData);
    showSnackbar("All data was replaced by JSON content.");
    setData(newData);
  };

  useEffect(() => {
    chrome.storage?.local.get().then((data) => {
      setData(data || {});
    });
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <ConfirmationText />
      <CopyToClipboardButton
        variant="solid"
        value={data}
        message="All data stored by this extension is copied to clipboard."
        title="Export all data stored by this extension into clipboard as a JSON content"
      >
        &nbsp; Export to Clipboard
      </CopyToClipboardButton>
      <Typography>Import data <Typography color="neutral">(do this only if you know what you are doing)</Typography>:</Typography>
      <Textarea
        minRows={15}
        value={jsonText}
        placeholder="Paste here JSON to import, this will replace extension state for all tabs and is irreversible and may cause extension malfunction."
        onChange={({ currentTarget: { value } }) => setJsonText(value)}
      />
      <Button
        color="danger"
        disabled={!isValidJson}
        title="Replace extension state for all tabs, this is irreversible and may cause extension malfunction"
        sx={{ alignSelf: "flex-end", marginTop: "8px" }}
        onClick={handleImport}
      >
        Replace everything by JSON content
      </Button>
    </Box>
  );
};
