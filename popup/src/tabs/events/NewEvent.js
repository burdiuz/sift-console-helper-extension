import Autocomplete from "@mui/joy/Autocomplete";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import { useCallback, useMemo, useState } from "react";
import { getCustomEventPayload } from "./payload";
import { useConfig } from "ConfigContext";

export const NewEvent = ({ onContinue }) => {
  const { getConfig } = useConfig();
  const { data, options } = useMemo(() => {
    const data = getConfig().events.templates;
    const options = Object.keys(data);

    return { data, options };
  }, []);
  const [allowMixins, setAllowMixins] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [description, setDescription] = useState("");

  const handleSelectEvent = useCallback((event) => {
    if (!event) {
      setTemplates([]);
      setAllowMixins(true);
      setSelectedEvent("");
      return;
    }

    setSelectedEvent(event);
    const eventData = data[event];

    if (eventData) {
      // "meta" is an optional event configuration object and not a template
      // it must be excluded from a selection
      const templates = Object.keys(eventData).filter((name) => name != "meta");
      setTemplates(templates);
      setAllowMixins(eventData.meta?.allowMixins ?? true);
      setSelectedTemplate(templates[0]);
    } else {
      setTemplates([]);
      setAllowMixins(true);
      setSelectedTemplate("");
    }
  }, []);

  const handleContinue = () => {
    const template = selectedTemplate
      ? { ...data[selectedEvent][selectedTemplate] }
      : getCustomEventPayload(selectedEvent);

    const options = {
      event: selectedEvent,
      description,
      allowMixins,
      template: JSON.stringify(template, null, 2),
    };

    onContinue(options);
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: "8px" }}>
        <Autocomplete
          value={selectedEvent}
          options={options}
          freeSolo
          onChange={(event, str, type, option) => handleSelectEvent(str)}
          sx={{ flex: 1 }}
          placeholder="Select reserved or provide custom event and hit Enter"
        />
        <Select
          value={selectedTemplate}
          disabled={templates.length < 2}
          onChange={(_, value) => setSelectedTemplate(value)}
          placeholder="Select event payload template"
          sx={{ flex: 1 }}
        >
          {templates.map((key) => (
            <Option key={key} value={key}>
              {key}
            </Option>
          ))}
        </Select>
        <Button disabled={!selectedEvent} onClick={handleContinue}>
          Continue
        </Button>
      </Box>
      <Input
        value={description}
        onChange={({ currentTarget: { value } }) => setDescription(value)}
        placeholder="Optional event description"
        sx={{ flex: 1 }}
      />
    </>
  );
};
