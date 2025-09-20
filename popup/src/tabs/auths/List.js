import Table from "@mui/joy/Table";
import { Fragment } from "react";
import { DateRow } from "./DateRow";
import { ItemRow } from "./ItemRow";

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
                  <DateRow date={item.date} />
                  <ItemRow
                    value={item}
                    onApply={onApply}
                    onRemove={onRemove}
                    showHost
                  />
                </Fragment>
              );
            } else {
              return (
                <ItemRow
                  key={item.id}
                  value={item}
                  onApply={onApply}
                  onRemove={onRemove}
                  showHost
                />
              );
            }
          });
        })()}
      </tbody>
    </Table>
  );
};
