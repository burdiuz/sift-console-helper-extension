import Box from "@mui/joy/Box";
import Table from "@mui/joy/Table";
import { ListItem } from "./ListItem";
import { NewItem } from "./NewItem";

export const List = ({
  dumps,
  onDump,
  onEdit,
  onRemove,
  onMerge,
  onReplace,
}) => {
  return (
    <Box>
      <NewItem onDump={onDump} />
      <Table>
        <thead>
          <tr>
            <th style={{ width: "45px" }}></th>
            <th>Description / Host</th>
            <th style={{ width: "80px" }}>Date</th>
            <th style={{ width: "115px" }}></th>
            <th style={{ width: "65px" }}></th>
          </tr>
        </thead>
        <tbody>
          {dumps.map((item) => (
            <ListItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onRemove={onRemove}
              onMerge={onMerge}
              onReplace={onReplace}
            />
          ))}
        </tbody>
      </Table>
    </Box>
  );
};
