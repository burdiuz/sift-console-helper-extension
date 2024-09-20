import Box from "@mui/joy/Box";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import AccordionGroup from "@mui/joy/AccordionGroup";
import AccordionSummary from "@mui/joy/AccordionSummary";
import LinearProgress from "@mui/joy/LinearProgress";
import Typography from "@mui/joy/Typography";
import Report from "@mui/icons-material/Report";
import { CopyToClipboardButton } from "shared/CopyToClipboardButton";
import { useEffect, useState } from "react";

export const RunList = ({ event, onExecute }) => {
  const [completed, setCompleted] = useState(false);
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const repeats = event.repeats || 1;
    const timeout = event.timeout || 0;

    (async () => {
      for (let index = 0; index < repeats; index++) {
        const id = Date.now();

        setRequests((list) => {
          const newList = [...list];
          newList[index] = { id };
          return newList;
        });

        setTitle(
          `(${index + 1}/${repeats}) ${event.event} ${
            event.description ? ` / ${event.description}` : ""
          }`
        );

        document.querySelector("html > head > title").textContent = `(${
          index + 1
        }/${repeats}) Sending "${event.event}" to ${event.env}`;

        const item = await onExecute();

        setRequests((list) => {
          const newList = [...list];
          newList[index] = { ...item, id };
          return newList;
        });

        if (timeout) {
          await new Promise((res) => setTimeout(res, timeout));
        }
      }

      setCompleted(true);
    })();
  }, []);

  useEffect(() => {
    if (!title) {
      return;
    }

    const titleNode = document.querySelector("head > title");
    titleNode.innerText = title;
  }, [title]);

  return (
    <Box>
      <Typography level="body-lg" sx={{ padding: "8px" }}>
        {title}
      </Typography>
      {completed ? (
        <Typography sx={{ textAlign: "center" }}>
          <Report
            color="success"
            sx={{
              width: "16px",
              height: "16px",
              verticalAlign: "middle",
            }}
          />{" "}
          All events have been sent, you can close this window.
        </Typography>
      ) : (
        <Typography sx={{ textAlign: "center" }}>
          <Report
            color="danger"
            sx={{
              width: "16px",
              height: "16px",
              verticalAlign: "middle",
            }}
          />{" "}
          This view is responsible for sending events. Please, do not close it
          if you want to continue with sending events.
        </Typography>
      )}
      <AccordionGroup>
        {[...requests].reverse().map(({ id, eventBody, result }, index) => (
          <Accordion key={id}>
            <AccordionSummary>
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <Typography color="neutral">
                  {requests.length - index}.
                </Typography>{" "}
                {result ? (
                  <Typography level="body-lg">
                    {result.status} {result.statusText}
                  </Typography>
                ) : (
                  <>
                    <Typography level="body-lg">&nbsp;</Typography>
                    <LinearProgress
                      sx={{
                        flex: "0 0 30%",
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                    />
                  </>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {result ? (
                <>
                  <Box sx={{ display: "flex" }}>
                    {result.errorMessage ? (
                      <Typography sx={{ textAlign: "center" }}>
                        <Report
                          color="danger"
                          sx={{
                            width: "16px",
                            height: "16px",
                            verticalAlign: "middle",
                          }}
                        />{" "}
                        {result.errorMessage}
                      </Typography>
                    ) : (
                      <>
                        <CopyToClipboardButton
                          value={eventBody}
                          message="Request body copied to clipboard."
                          title="Copy request body into clipboard."
                        >
                          Copy request body
                        </CopyToClipboardButton>
                        <CopyToClipboardButton
                          value={result}
                          message="Response body copied to clipboard."
                          title="Copy response body into clipboard."
                        >
                          Copy response body
                        </CopyToClipboardButton>
                      </>
                    )}
                  </Box>
                  <pre style={{ overflow: "scroll" }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </>
              ) : (
                <Typography>
                  This request is currently in progress...
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionGroup>
    </Box>
  );
};
