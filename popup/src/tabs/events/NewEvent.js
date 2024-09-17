import Autocomplete from "@mui/joy/Autocomplete";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import { useCallback, useMemo, useState } from "react";
import { getCustomEventPayload, getEventsData } from "./payload";
import { Sender } from "./utils";

const SenderOptions = [
  { label: "Sent by browser", value: Sender.BROWSER },
  { label: "Sent by an app", value: Sender.APP },
];

export const NewEvent = ({ onContinue }) => {
  const { data, options } = useMemo(() => {
    const data = getEventsData();
    const options = Object.keys(data);

    return { data, options };
  }, []);

  const [sender, setSender] = useState(Sender.BROWSER);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [description, setDescription] = useState("");

  const handleSelectEvent = useCallback((event) => {
    if (!event) {
      setSelectedEvent("");
      setTemplates([]);
      return;
    }

    setSelectedEvent(event);
    const eventData = data[event];

    if (eventData) {
      const templates = Object.keys(eventData);
      setTemplates(templates);
      setSelectedTemplate(templates[0]);
    } else {
      setTemplates([]);
      setSelectedTemplate("");
    }
  }, []);

  const handleContinue = () => {
    const template = selectedTemplate
      ? { ...data[selectedEvent][selectedTemplate] }
      : getCustomEventPayload(selectedEvent);

    if (sender === Sender.APP) {
      delete template[Sender.BROWSER];
    } else {
      delete template[Sender.APP];
    }

    const options = {
      event: selectedEvent,
      description,
      sender,
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
      <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Input
          value={description}
          onChange={({ currentTarget: { value } }) => setDescription(value)}
          placeholder="Optional event description"
          sx={{ flex: 1 }}
        />
        <RadioGroup
          value={sender}
          orientation="horizontal"
          onChange={({ target: { value } }) => setSender(value)}
        >
          {SenderOptions.map(({ label, value }) => (
            <Radio key={label} value={value} label={label}></Radio>
          ))}
        </RadioGroup>
      </Box>
    </>
  );
};
