import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Table from "@mui/joy/Table";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Fragment, useEffect, useMemo, useState } from "react";
import Divider from "@mui/joy/Divider";
import { CopyToClipboardButton } from "shared/CopyToClipboardButton";
import { ShareButton } from "shared/ShareButton";
import { useConfig } from "ConfigContext";
import { getActiveTab, getTabRootUrl } from "extension/utils";

const HostRow = ({ host }) => (
  <tr>
    <td colSpan={4}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: (theme) => theme.vars.palette.background.level2,
        }}
      >
        <Divider sx={{ flex: "1" }} />
        {host || "Other"}
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
      <td>
        {new Date(value.date).toLocaleDateString()}&nbsp;
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

export const List = ({ list, onApply, onRemove }) => {
  const [currentTabHost, setCurrentTabHost] = useState("");

  const sections = useMemo(() => {
    const map = list.reduce((ret, item) => {
      const { host = "" } = item;

      if (!ret[host]) {
        ret[host] = [];
      }

      ret[host].push(item);
      return ret;
    }, {});

    return Object.entries(map)
      .map(([host, list]) => ({
        host,
        list,
      }))
      .sort(({ host: a }, { host: b }) => {
        // auths without a host information are placed into last section
        if (!a) return 1;
        if (!b) return -1;

        // auths for current tab host are placed into first section
        if (a === currentTabHost) return -1;
        if (b === currentTabHost) return 1;

        // other sections sorted by host name
        return a < b ? -1 : 1;
      });
  }, [list, currentTabHost]);

  useEffect(() => {
    getActiveTab().then((tab) => {
      setCurrentTabHost(getTabRootUrl(tab));
    });
  }, []);

  return (
    <Table>
      <thead>
        <tr>
          <th style={{ width: "145px" }}></th>
          <th>Host / Name</th>
          <th style={{ width: "170px" }}>Date</th>
          <th style={{ width: "45px" }}></th>
        </tr>
      </thead>
      <tbody>
        {sections.map(({ host, list }) => {
          return (
            <Fragment key={host}>
              <HostRow host={host} />
              {list.map((item) => (
                <ItemRow
                  key={item.id}
                  value={item}
                  onApply={onApply}
                  onRemove={onRemove}
                />
              ))}
            </Fragment>
          );
        })}
      </tbody>
    </Table>
  );
};
