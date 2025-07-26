import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Table from "@mui/joy/Table";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Fragment } from "react";
import Divider from "@mui/joy/Divider";
import { CopyToClipboardButton } from "shared/CopyToClipboardButton";
import { ShareButton } from "shared/ShareButton";
import { useConfig } from "ConfigContext";

/*

        <hr
          style={{
            flex: "1",
            borderColor: "var(--joy-palette-divider)",
          }}
        />
*/

const SeparatorRow = ({ date }) => (
  <tr>
    <td colSpan={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Divider sx={{ flex: "1" }} />
        {new Date(date).toLocaleDateString()}
        <Divider sx={{ flex: "1" }} />
      </Box>
    </td>
  </tr>
);

const ItemRow = ({ value, onApply, onRemove }) => {
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
        {value.name}
      </td>
      <td>{new Date(value.date).toLocaleTimeString()}</td>
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

export const List = ({ list, onApply, onRemove }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th style={{ width: "145px" }}></th>
          <th>Host / Name</th>
          <th style={{ width: "80px" }}>Time</th>
          <th style={{ width: "45px" }}></th>
        </tr>
      </thead>
      <tbody>
        {(() => {
          let lastDate = "";

          return list.map((item) => {
            const date = new Date(item.date).toDateString();

            if (lastDate !== date) {
              lastDate = date;
              return (
                <Fragment key={item.id}>
                  <SeparatorRow date={item.date} />
                  <ItemRow value={item} onApply={onApply} onRemove={onRemove} />
                </Fragment>
              );
            } else {
              return (
                <ItemRow
                  key={item.id}
                  value={item}
                  onApply={onApply}
                  onRemove={onRemove}
                />
              );
            }
          });
        })()}
      </tbody>
    </Table>
  );
};
