import Table from "@mui/joy/Table";
import { Fragment, useEffect, useMemo, useState } from "react";
import { getActiveTab, getTabRootUrl } from "extension/utils";
import { HostRow } from "./HostRow";
import { ItemRow } from "./ItemRow";

export const Sections = ({ list, onApply, onRemove }) => {
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
          <th>Name</th>
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
                  showDate
                />
              ))}
            </Fragment>
          );
        })}
      </tbody>
    </Table>
  );
};
