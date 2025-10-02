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
  const [customEventName, setCustomEventName] = useState("");
  const [description, setDescription] = useState("");

  const getEventTemplateNames = (eventName) =>
    // "meta" is an optional event configuration object and not a template
    // it must be excluded from a selection
    Object.keys(data[eventName] || {}).filter((name) => name != "meta");

  const handleSelectEvent = useCallback((eventName) => {
    if (!eventName) {
      setTemplates([]);
      setAllowMixins(true);
      setSelectedEvent("");
      setCustomEventName("");
      return;
    }

    setSelectedEvent(eventName);
    const eventData = data[eventName];

    if (eventData) {
      const templates = getEventTemplateNames(eventName);
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
    const options = {
      event: selectedEvent || customEventName,
      description,
      allowMixins,
    };

    let template;

    if (selectedTemplate) {
      template = { ...data[selectedEvent][selectedTemplate] };
    } else if (selectedEvent || data[customEventName]) {
      // in case if user entered a selectable event name but never selected it
      const eventName = selectedEvent || customEventName;
      const templateName = getEventTemplateNames(eventName)[0];

      if (templateName) {
        template = { ...data[eventName][templateName] };
      } else {
        template = getCustomEventPayload(eventName);
        options.allowMixins = false;
      }
    } else if (customEventName) {
      template = getCustomEventPayload(customEventName);
      options.allowMixins = false;
    } else {
      // if nothing was selected we provide template with no event name
      template = getCustomEventPayload("{{EVENT_NAME}}");
      options.allowMixins = false;
    }

    options.template = JSON.stringify(template, null, 2);
    onContinue(options);
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: "8px" }}>
        <Autocomplete
          value={selectedEvent}
          inputValue={customEventName}
          options={options}
          onChange={(_, str) => handleSelectEvent(str)}
          onInputChange={(_, str) => setCustomEventName(str)}
          sx={{ flex: 1 }}
          placeholder="Select reserved or provide custom event and hit Enter"
          openOnFocus
          freeSolo
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
        <Button
          disabled={!selectedEvent && customEventName.length < 3}
          onClick={handleContinue}
        >
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
