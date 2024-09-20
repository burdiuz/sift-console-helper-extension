import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Input,
  Typography,
} from "@mui/joy";
import { useMemo, useState } from "react";
import { HTTPResponseStatus } from "./HTTPResponseStatus";
import { JsonEditor } from "shared/JsonEditor";
import Report from "@mui/icons-material/Report";

export const NewMock = ({
  onCancel,
  onSave,
  availableGroups = [],
  item = {},
}) => {
  const [url, setUrl] = useState(item.url);
  const [regexp, setRegexp] = useState(item.regexp || false);
  const [group, setGroup] = useState(item.group || "");
  const [description, setDescription] = useState(item.description || "");
  const [status, setStatus] = useState(item.status || "200");
  const [statusText, setStatusText] = useState(item.statusText || "Ok");
  const [body] = useState(item.body || "{\n  \n}");

  const isValidRegExp = useMemo(() => {
    if (!regexp) return true;

    try {
      new RegExp(url);
      return true;
    } catch (err) {
      return false;
    }
  }, [regexp, url]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Checkbox
          checked={regexp}
          onChange={({ currentTarget: { checked } }) => setRegexp(checked)}
        />
        <Typography>RegExp</Typography>
        <Input
          value={url}
          onChange={({ currentTarget: { value } }) => setUrl(value)}
          startDecorator={regexp ? "/" : " "}
          endDecorator={
            regexp ? (
              <>
                /
                {isValidRegExp ? null : (
                  <Report
                    color="danger"
                    title="Is not a valid Regular Expression"
                  />
                )}
              </>
            ) : (
              " "
            )
          }
          placeholder={
            regexp
              ? "Provide a regilar expression to match an API request url"
              : "Provide a portion of URL to match an API request"
          }
          sx={{ flex: 1 }}
        />
        <HTTPResponseStatus
          Status
          status={status}
          statusText={statusText}
          onChange={({ status, statusText }) => {
            setStatus(status);
            setStatusText(statusText);
          }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: "8px" }}>
        <Autocomplete
          value={group}
          options={availableGroups}
          freeSolo
          onChange={(event, str, type, option) => setGroup(str)}
          placeholder="Select group or provide new and hit Enter"
          sx={{ width: "270px" }}
        />
        <Input
          value={description}
          onChange={({ currentTarget: { value } }) => setDescription(value)}
          placeholder="Optional description to the API mock"
          sx={{ flex: 1 }}
        />
      </Box>
      <JsonEditor value={body}>
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
                  &nbsp;Editor content is not a valid JSON
                </>
              )}
            </span>
            <Button
              disabled={!url}
              onClick={() =>
                onSave({
                  id: Date.now(),
                  enabled: true,
                  ...item,
                  url,
                  regexp,
                  description,
                  group,
                  status,
                  statusText,
                  body,
                  date: Date.now(),
                })
              }
            >
              Save
            </Button>
            <Button onClick={() => onCancel()}>Cancel</Button>
          </Box>
        )}
      </JsonEditor>
    </Box>
  );
};
