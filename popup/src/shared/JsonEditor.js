import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { dracula } from "@uiw/codemirror-theme-dracula";
import Box from "@mui/joy/Box";
import { useMemo, useState } from "react";
import { HeightProvider } from "./HeightProvider";

export const JsonEditor = ({ value, refresh, children, onChange }) => {
  // CodeMirror has its own state so it is not required to provide updates
  const [updatedValue, setUpdatedValue] = useState(value);
  const isValidJson = useMemo(() => {
    try {
      JSON.parse(updatedValue);
      return true;
    } catch (error) {
      return false;
    }
  }, [updatedValue]);

  return (
    <HeightProvider refresh={refresh}>
      {(ref, height) => (
        <Box
          ref={ref}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            height: `${height}px`,
          }}
        >
          <Box style={{ flex: 1, overflow: "auto" }}>
            <CodeMirror
              value={value}
              extensions={[json()]}
              theme={dracula}
              onChange={(newValue) => {
                setUpdatedValue(newValue);
                onChange?.(newValue);
              }}
            />
          </Box>
          {typeof children === "function"
            ? children(updatedValue, isValidJson)
            : children}
        </Box>
      )}
    </HeightProvider>
  );
};
