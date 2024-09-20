import { Box, Button, Checkbox, Input, Typography } from "@mui/joy";
import { useCallback, useState } from "react";
import { HTTPResponseStatus } from "./HTTPResponseStatus";
import { HeightProvider } from "shared/HeightProvider";
import { JsonEditor } from "shared/JsonEditor";
import Report from "@mui/icons-material/Report";
import { NewMock } from "./NewMock";

/**
 * Must handle queue of API request intercepts.
 */
// TODO Add grouping
export const ApiCallsView = () => {
  const [list, setList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSaveSelectedItem = useCallback((item) => {});

  return selectedItem ? (
    <NewMock
      item={selectedItem}
      onCancel={() => setSelectedItem(null)}
      onSave={handleSaveSelectedItem}
    />
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column" }}></Box>
  );
};
