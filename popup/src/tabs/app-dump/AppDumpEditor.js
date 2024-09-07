import Report from "@mui/icons-material/Report";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import { JsonEditor } from "shared/JsonEditor";
import { useMemo } from "react";

export const AppDumpEditor = ({ value, onSave, onClose }) => {
  const code = useMemo(() => {
    return JSON.stringify(
      { ...value, id: undefined, date: undefined },
      null,
      2
    );
  }, [value]);

  return (
    <JsonEditor value={code}>
      {(updatedValue, isValid) => (
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            marginTop: "8px",
            marginBottom: "32px",
          }}
        >
          <span style={{ flex: "1" }}>
            {!isValid && (
              <>
                <Report
                  color="danger"
                  sx={{
                    width: "16px",
                    height: "16px",
                    verticalAlign: "middle",
                  }}
                />
                &nbsp;Editor content is not a valid JSON and cannot be saved.
              </>
            )}
          </span>
          <Button
            disabled={!isValid}
            onClick={() =>
              onSave({
                ...value,
                ...JSON.parse(updatedValue),
              })
            }
          >
            Save changes
          </Button>
          <Button onClick={() => onClose()}>Close without saving</Button>
        </Box>
      )}
    </JsonEditor>
  );
};
