import { useCallback, useEffect, useState } from "react";
import IconImageSource from "./mixpanel_icon.png";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import AccordionGroup from "@mui/joy/AccordionGroup";
import AccordionSummary from "@mui/joy/AccordionSummary";
import { Box } from "@mui/joy";
import { CopyToClipboardButton } from "shared/CopyToClipboardButton";
import { getActiveTab } from "extension/utils";

const { chrome } = window;

export const MixpanelIcon = () => {
  return <img src={IconImageSource} alt="Mixpanel" height="16" />;
};

export const MixpanelView = () => {
  const [list, setList] = useState([]);

  const handleUpdate = useCallback(async (message) => {
    if (
      typeof message === "object" &&
      message?.type === "mixpanel-event-list-updated"
    ) {
      const { tabId, data } = message;
      const tab = await getActiveTab();

      if (tabId === tab.id) {
        setList([...data].reverse());
      }
    }
  }, []);

  useEffect(() => {
    chrome.runtime?.onMessage.addListener(handleUpdate);

    getActiveTab().then(({ id }) => {
      chrome.runtime?.sendMessage(
        { type: "get-mixpanel-tracking-events-info", tabId: id },
        (list) => setList((list || []).reverse())
      );
    });

    return () => {
      chrome.runtime?.onMessage.removeListener(handleUpdate);
    };
  }, []);

  return (
    <AccordionGroup>
      {list.map((item) => {
        const customProps = { ...item.properties };

        Object.getOwnPropertyNames(customProps).forEach((key) => {
          if (key.charAt(0) === "$") {
            delete customProps[key];
          }
        });

        return (
          <Accordion key={`${item.properties.time}`}>
            <Box sx={{ display: "flex" }}>
              <CopyToClipboardButton
                value={item}
                message="Track event copied to clipboard."
                title="Copy track event JSON into clipboard"
              />
              <AccordionSummary
                sx={{
                  display: "flex",
                  flex: 1,
                }}
              >
                <span style={{ marginRight: "auto" }}>{item.event}</span>
                <span>
                  {new Date(item.properties.time * 1000).toLocaleTimeString()}
                </span>
              </AccordionSummary>
            </Box>
            <AccordionDetails>
              <pre>{JSON.stringify(customProps, null, 2)}</pre>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </AccordionGroup>
  );
};
