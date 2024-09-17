import Input from "@mui/joy/Input";
import Checkbox from "@mui/joy/Checkbox";
import { useState } from "react";
import SaveIcon from "@mui/icons-material/Save";

export const FFInput = ({
  type = "text",
  typeConverter = (value) => value,
  value,
  onChange,
  trigger = false,
}) => {
  const [updatedValue, setUpdatedValue] = useState(value);

  return (
    <Input
      type={type}
      value={String(trigger ? updatedValue : value)}
      onChange={({ currentTarget: { value } }) => {
        const newValue = typeConverter(value);
        trigger ? setUpdatedValue(newValue) : onChange(newValue);
      }}
      placeholder="New value here"
      startDecorator={
        trigger &&
        (value !== updatedValue ? (
          <SaveIcon
            color="primary"
            sx={{
              cursor: "pointer",
            }}
            onClick={() => onChange(updatedValue)}
          />
        ) : (
          <SaveIcon sx={{ opacity: "0" }} />
        ))
      }
    />
  );
};

export const renderInputByValueType = (value, changeHandler, trigger = false) => {
  if (typeof value === "boolean") {
    return (
      <>
        <Checkbox
          checked={value}
          size="lg"
          onChange={({ currentTarget: { checked } }) => changeHandler(checked)}
          sx={{ verticalAlign: "middle" }}
        />
        &nbsp;
        {value ? "Enabled" : "Disabled"}
      </>
    );
  }
  if (typeof value === "number") {
    return (
      <FFInput
        type="number"
        typeConverter={(value) => parseInt(value, 10) || 0}
        value={value}
        onChange={changeHandler}
        trigger={trigger}
      />
    );
  }

  return <FFInput value={value} onChange={changeHandler} trigger={trigger} />;
};

export const getDefaultValueByType = (type) => {
  switch (type) {
    case "boolean":
      return true;
    case "number":
      return 0;
    default:
      return "";
  }
};