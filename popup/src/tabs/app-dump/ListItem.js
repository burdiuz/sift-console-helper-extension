import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Checkbox from "@mui/joy/Checkbox";
import { useState } from "react";
import { CopyToClipboardButton } from "shared/CopyToClipboardButton";

/**
 *
 * @param {number} timestamp
 * @returns
 */
const toDateString = (timestamp) => new Date(timestamp).toLocaleString();

const labelColor = (value) => ({
  color: value ? "inherit" : "var(--joy-palette-neutral-plainDisabledColor)",
});

export const ListItem = ({ item, onEdit, onRemove, onMerge, onReplace }) => {
  const { id, name, description, date, cookies, localStorage, sessionStorage } =
    item;
  const [hasCookies, setHasCookies] = useState(!!cookies);
  const [hasLocalStorage, setHasLocalStorage] = useState(!!localStorage);
  const [hasSessionStorage, setHasSessionStorage] = useState(!!sessionStorage);

  const getOptions = () => ({
    hasCookies,
    hasLocalStorage,
    hasSessionStorage,
  });

  return (
    <tr>
      <td>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <Button
            variant="soft"
            title="Edit dump contents"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <ModeEditIcon />
          </Button>
          <CopyToClipboardButton
            value={item}
            message="Application state dump copied to clipboard."
            title="Copy dump contents into clipboard"
            variant="soft"
            size="sm"
          />
        </Box>
      </td>
      <td>
        {description && <div>{description}</div>}
        {name}
      </td>
      <td>{toDateString(date)}</td>
      <td>
        <div title="Write session cookies for root path with no expiration date or max-age set. Cookie settings can be changed in code editor(click on pencil button on the left).">
          <Checkbox
            id="cookies-checkbox"
            sx={{ verticalAlign: "middle" }}
            checked={hasCookies}
            disabled={!cookies}
            onChange={({ currentTarget: { checked } }) =>
              setHasCookies(checked)
            }
          />{" "}
          <label htmlFor="cookies-checkbox" style={labelColor(cookies)}>
            Cookies
          </label>
        </div>
        <div>
          <Checkbox
            id="ls-checkbox"
            sx={{ verticalAlign: "middle" }}
            checked={hasLocalStorage}
            disabled={!localStorage}
            onChange={({ currentTarget: { checked } }) =>
              setHasLocalStorage(checked)
            }
          />{" "}
          <label htmlFor="ls-checkbox" style={labelColor(localStorage)}>
            Local Storage
          </label>
        </div>
        <div>
          <Checkbox
            id="ss-checkbox"
            sx={{ verticalAlign: "middle" }}
            checked={hasSessionStorage}
            disabled={!sessionStorage}
            onChange={({ currentTarget: { checked } }) =>
              setHasSessionStorage(checked)
            }
          />{" "}
          <label htmlFor="ss-checkbox" style={labelColor(sessionStorage)}>
            Session Storage
          </label>
        </div>
      </td>
      <td>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Button
            variant="soft"
            title="Completely replace current content of selected storages. Existing values will be cleared."
            size="sm"
            onClick={() => onReplace(item, getOptions())}
          >
            Replace
          </Button>
          <Button
            variant="soft"
            title="Merge current state with state from dump, in case of key match individual values will be overwritten from dump"
            size="sm"
            onClick={() => onMerge(item, getOptions())}
          >
            Merge
          </Button>
          <Button
            variant="soft"
            color="danger"
            title="Delete app state dump"
            onClick={() => onRemove(id)}
          >
            Delete
          </Button>
        </Box>
      </td>
    </tr>
  );
};
