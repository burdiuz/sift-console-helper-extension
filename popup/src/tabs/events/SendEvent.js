import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Divider from "@mui/joy/Divider";
import Typography from "@mui/joy/Typography";
import { useCallback, useEffect, useState } from "react";
import { Environments, Runner } from "./utils";

const RESERVED_TEMPLATE_KEYS = ["RANDOM", "SEQUENCE"];

const RunnerOptions = [
  { label: "Run in a new Window", value: Runner.WINDOW },
  { label: "Run in a new Tab in current window", value: Runner.TAB },
];

export const SendEvent = ({ options, onSend }) => {
  const [runner, setRunner] = useState(options.runner || Runner.WINDOW);
  const [selectedEnv, setSelectedEnv] = useState(
    options.env || Environments.PROD
  );
  const [sendRepeats, setSendRepeats] = useState(options.repeats || 1);
  const [sendTimeout, setSendTimeout] = useState(options.timeout || 250);
  const [urlQuery, setUrlQuery] = useState(options.urlQuery || "");

  const [templateValues, setTemplateValues] = useState({});

  useEffect(() => {
    setTemplateValues(() => {
      const { template } = options;
      const keyValuePairs =
        template.match(/(?<=\{\{)([a-z0-9_-]+)(:[^}]+)?(?=\}\})/gi) || [];

      return keyValuePairs.reduce((ret, keyValue) => {
        const [, key, value = ""] = keyValue.match(/([^:]+)(?::(.*))?/i);

        if (RESERVED_TEMPLATE_KEYS.includes(key)) {
          return ret;
        }

        return { ...ret, [key]: value };
      }, {});
    });
  }, [options]);

  const handleTemplateValueChange = useCallback(
    (key, value) =>
      setTemplateValues((values) => ({ ...values, [key]: value })),
    []
  );

  const handleSend = () => {
    const result = {
      ...options,
      env: selectedEnv,
      runner,
      repeats: sendRepeats,
      timeout: sendTimeout,
      values: templateValues,
      urlQuery,
    };

    onSend(result);
  };

  const templateValueEntries = Object.entries(templateValues);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "flex-end",
      }}
    >
      <Divider />
      {templateValueEntries.length ? (
        <>
          <Typography sx={{ alignSelf: "stretch" }}>
            Template values:
          </Typography>
          <Box
            sx={{
              display: "flex",
              rowGap: "8px",
              columnGap: "16px",
              alignSelf: "stretch",
              flexWrap: "wrap",
            }}
          >
            {templateValueEntries.map(([key, value]) => (
              <Box
                key={key}
                sx={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <span>{key}:</span>
                <Input
                  placeholder="Value"
                  value={value}
                  onChange={({ currentTarget: { value } }) =>
                    handleTemplateValueChange(key, value)
                  }
                />
              </Box>
            ))}
          </Box>
        </>
      ) : null}
      <Typography sx={{ alignSelf: "stretch", marginTop: "8px" }}>
        Send parameters:
      </Typography>
      <Input
        startDecorator={"?"}
        value={urlQuery}
        onChange={({ currentTarget: { value } }) => setUrlQuery(value)}
        placeholder="Optional URL query parameters string"
        sx={{ alignSelf: "stretch" }}
      />
      <Box sx={{ display: "flex", gap: "8px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginRight: "16px",
          }}
        >
          Repeat{" "}
          <Input
            type="number"
            value={String(sendRepeats)}
            onChange={({ currentTarget: { value } }) =>
              setSendRepeats(parseInt(value, 10) || 0)
            }
            sx={{ width: "60px" }}
          />{" "}
          times
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginRight: "16px",
          }}
        >
          Timeout between repeats
          <Input
            type="number"
            value={String(sendTimeout)}
            onChange={({ currentTarget: { value } }) =>
              setSendTimeout(parseInt(value, 10) || 0)
            }
            sx={{ width: "80px" }}
          />
          ms
        </Box>
        <Select
          value={selectedEnv}
          onChange={(_, value) => setSelectedEnv(value)}
          style={{ width: "80px" }}
        >
          {Object.entries(Environments).map(([key, value]) => (
            <Option key={key} value={value}>
              {key}
            </Option>
          ))}
        </Select>
        <Button color="primary" disabled={!sendRepeats} onClick={handleSend}>
          Send
        </Button>
      </Box>
      <RadioGroup
        value={runner}
        orientation="horizontal"
        onChange={({ target: { value } }) => setRunner(value)}
        sx={{ marginRight: "60px" }}
      >
        {RunnerOptions.map(({ label, value }) => (
          <Radio key={label} value={value} label={label}></Radio>
        ))}
      </RadioGroup>
    </Box>
  );
};
