import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import { useCallback, useState } from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { getDefaultValueByType, renderInputByValueType } from "./FFInput";

export const NewItem = ({ onAdd }) => {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("boolean");
  const [newValue, setNewValue] = useState(true);

  const handleAdd = useCallback(() => {
    onAdd(newName, newValue);
    setNewName("");
    setNewValue(getDefaultValueByType(newType));
  }, [onAdd, newName, newType, newValue]);

  return (
    <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Input
        type="text"
        value={newName}
        placeholder="New feature flag name / key"
        onChange={({ target: { value } }) => setNewName(value)}
        sx={{ flex: 1 }}
      />
      <Select
        sx={{ width: "100px" }}
        value={newType}
        onChange={(_, value) => {
          setNewType(value);
          setNewValue(getDefaultValueByType(value));
        }}
        title="Set value type for new feature flag"
      >
        <Option value="boolean">Boolean</Option>
        <Option value="string">String</Option>
        <Option value="number">Number</Option>
      </Select>
      <Box sx={{ width: "170px" }}>
        {renderInputByValueType(newValue, setNewValue)}
      </Box>
      <Button
        onClick={handleAdd}
        disabled={!newName}
        title="Add new feature flag"
      >
        <AddCircleIcon />
      </Button>
    </Box>
  );
};
