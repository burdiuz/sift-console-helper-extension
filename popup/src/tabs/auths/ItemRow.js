import Button from "@mui/joy/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { CopyToClipboardButton } from "shared/CopyToClipboardButton";
import { ShareButton } from "shared/ShareButton";
import { useConfig } from "ConfigContext";

export const ItemRow = ({ value, onApply, onRemove, showHost, showDate }) => {
  const { getConfig } = useConfig();

  return (
    <tr>
      <td>
        <Button
          variant="soft"
          title="Apply authentication session to target tab"
          onClick={() => onApply(value)}
        >
          Apply
        </Button>
        <CopyToClipboardButton
          value={value}
          title="Copy to Clipboard entire auth session. It may include long-living authentication keys, so you may not want to share it."
          message="Auth session JSON copied to clipboard."
          sx={{ verticalAlign: "middle" }}
        />
        <ShareButton
          value={`Object.entries(${JSON.stringify(
            getConfig().auths.authShareKeys.reduce(
              (res, key) => ({
                ...res,
                [key]: value.data[key],
              }),
              {}
            )
          )}).forEach(([key, value]) => localStorage.setItem(key, value));`}
          title="Copy to Clipboad a script to apply Auth session via browser DevTools console."
          message="Shareable Auth session JS code copied to clipboard."
          sx={{ verticalAlign: "middle" }}
        />
      </td>
      <td>
        {value.description ? <div>{value.description}</div> : null}
        {showHost && value.host ? `${value.host} / ` : ""}
        {value.name}
      </td>
      <td>
        {showDate ? `${new Date(value.date).toLocaleDateString()} ` : ""}
        {new Date(value.date).toLocaleTimeString()}
      </td>
      <td>
        <Button
          variant="soft"
          color="danger"
          title="Delete authentication session"
          onClick={() => onRemove(value)}
        >
          <DeleteForeverIcon />
        </Button>
      </td>
    </tr>
  );
};
