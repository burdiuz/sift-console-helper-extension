import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import AccordionGroup from "@mui/joy/AccordionGroup";
import AccordionSummary from "@mui/joy/AccordionSummary";
import Typography from "@mui/joy/Typography";
import { JsonEditor } from "shared/JsonEditor";
import WarningIcon from "@mui/icons-material/Warning";
import { useState } from "react";

export const EventJsonEditor = ({ template, onSave, onCancel }) => {
  const [accordionState, setAccordionState] = useState(false);

  return (
    <>
      <AccordionGroup transition="0s ease">
        <Accordion onChange={setAccordionState}>
          <AccordionSummary>
            Code editor allows you to modify event data including template marks
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Template mark should be wrapped with &#123;&#123; and &#125;&#125;
              and contain <strong>a-z A-Z 0-9 _ -</strong>, for example:<br />
              <strong>&#123;&#123;MyMark1&#125;&#125;</strong>,{" "}
              <strong>&#123;&#123;my_mark_2&#125;&#125;</strong>,{" "}
              <strong>&#123;&#123;MY-MARK-3&#125;&#125;</strong>.<br />
              Template mark can be used multiple times and may contain default value provided after a colon symbol:<br />
              <strong>&#123;&#123;API_KEY:3h3g2g23hh4j&#125;&#125;</strong>
            </Typography>
            <br />
            <Typography>Reserved template marks:</Typography>
            <Typography>
              <strong>&#123;&#123;SEQUENCE&#125;&#125;</strong> -- will be
              replaced with a number starting from 1 and increasing by 1 on each
              repeat.
            </Typography>
            <Typography>Allows to specify a range of numbers:</Typography>
            <Typography>
              <strong>&#123;&#123;SEQUENCE:10&#125;&#125;</strong> -- will be
              replaced with a number starting from 10 and increasing by 1 on
              each repeat.
            </Typography>
            <Typography>
              <strong>&#123;&#123;SEQUENCE:10:2&#125;&#125;</strong> -- will be
              replaced with a number starting from 10 and increasing by 2 on
              each repeat.
            </Typography>
            <br />
            <Typography>
              <strong>&#123;&#123;RANDOM&#125;&#125;</strong> -- will be
              replaced with a random integer number.
            </Typography>
            <Typography>Allows to specify a range of numbers:</Typography>
            <Typography>
              <strong>&#123;&#123;RANDOM:10&#125;&#125;</strong> -- will
              generate random integer between 0 and 10.
            </Typography>
            <Typography>
              <strong>&#123;&#123;RANDOM:10:100&#125;&#125;</strong> -- will
              generate random integer between 10 and 100.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
      <JsonEditor value={template} refresh={accordionState}>
        {(updatedCode, isValid) => (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <span style={{ flex: "1" }}>
              {!isValid && (
                <>
                  <WarningIcon
                    color="warning"
                    sx={{
                      width: "16px",
                      height: "16px",
                      verticalAlign: "middle",
                    }}
                  />
                  &nbsp;Editor content is not a valid JSON, make sure it is
                  properly formed.
                </>
              )}
            </span>
            <Button color="primary" onClick={() => onSave(updatedCode)}>
              Save Event
            </Button>
            <Button color="neutral" onClick={() => onCancel()}>
              Cancel
            </Button>
          </Box>
        )}
      </JsonEditor>
    </>
  );
};
