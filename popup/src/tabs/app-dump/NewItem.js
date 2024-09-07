import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Checkbox from "@mui/joy/Checkbox";
import { useState } from "react";

export const NewItem = ({ onDump }) => {
  const [newDescription, setNewDescription] = useState("");
  const [hasCookies, setHasCookies] = useState(false);
  const [hasLocalStorage, setHasLocalStorage] = useState(true);
  const [hasSessionStorage, setHasSessionStorage] = useState(true);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <Input
        placeholder="Application state dump description"
        sx={{ flex: 1 }}
        value={newDescription}
        onChange={({ currentTarget: { value } }) => setNewDescription(value)}
      />
      <Box
        sx={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <span title="Dump cookies available to current domain">
          <Checkbox
            id="dump-cookies-checkbox"
            sx={{ verticalAlign: "middle" }}
            checked={hasCookies}
            onChange={({ currentTarget: { checked } }) =>
              setHasCookies(checked)
            }
          />{" "}
          <label htmlFor="dump-cookies-checkbox">Cookies</label>
        </span>
        <span>
          <Checkbox
            id="dump-ls-checkbox"
            sx={{ verticalAlign: "middle" }}
            checked={hasLocalStorage}
            onChange={({ currentTarget: { checked } }) =>
              setHasLocalStorage(checked)
            }
          />{" "}
          <label htmlFor="dump-ls-checkbox">Local Storage</label>
        </span>
        <span>
          <Checkbox
            id="dump-ss-checkbox"
            sx={{ verticalAlign: "middle" }}
            checked={hasSessionStorage}
            onChange={({ currentTarget: { checked } }) =>
              setHasSessionStorage(checked)
            }
          />{" "}
          <label htmlFor="dump-ss-checkbox">Session Storage</label>
        </span>
        <Button
          disabled={!(hasCookies || hasLocalStorage || hasSessionStorage)}
          onClick={() => {
            onDump({
              description: newDescription,
              hasCookies: hasCookies,
              hasLocalStorage: hasLocalStorage,
              hasSessionStorage: hasSessionStorage,
            });
            setNewDescription("");
            setHasCookies(false);
            setHasLocalStorage(true);
            setHasSessionStorage(true);
          }}
        >
          Dump
        </Button>
      </Box>
    </Box>
  );
};
