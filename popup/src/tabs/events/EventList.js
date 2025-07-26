import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Accordion from "@mui/joy/Accordion";
import EditIcon from "@mui/icons-material/Edit";
import AccordionDetails from "@mui/joy/AccordionDetails";
import AccordionGroup from "@mui/joy/AccordionGroup";
import AccordionSummary from "@mui/joy/AccordionSummary";
import Divider from "@mui/joy/Divider";
import { NewEvent } from "./NewEvent";
import { SendEvent } from "./SendEvent";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";

export const EventList = ({
  list,
  onEdit,
  onDuplicate,
  onContinue,
  onRemove,
  onSend,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <NewEvent onContinue={onContinue} />
      <Divider />
      <AccordionGroup>
        {list.map((item) => {
          const { id, event, description } = item;
          return (
            <Accordion key={id}>
              <Box sx={{ display: "flex", gap: "8px" }}>
                <Button variant="plain" size="sm" onClick={() => onEdit(item)}>
                  <EditIcon />
                </Button>
                <Button
                  variant="plain"
                  size="sm"
                  onClick={() => onDuplicate(item)}
                >
                  <LibraryAddIcon />
                </Button>
                <AccordionSummary sx={{ flex: 1 }}>
                  {event}
                  {description ? ` / ${description}` : null}
                </AccordionSummary>
              </Box>
              <AccordionDetails>
                <SendEvent options={item} onSend={onSend} onRemove={onRemove} />
              </AccordionDetails>
            </Accordion>
          );
        })}
      </AccordionGroup>
    </Box>
  );
};
