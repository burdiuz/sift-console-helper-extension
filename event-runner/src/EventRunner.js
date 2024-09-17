import "./App.css";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import "@fontsource/inter";
import { useCallback, useEffect, useRef, useState } from "react";
import { Typography } from "@mui/joy";
import { RunList } from "RunList";

const { chrome } = window;

const NotAvailable = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "600px",
    }}
  >
    <Typography>
      Waiting for event data and context initialization...
    </Typography>
  </Box>
);

const ValueType = {
  RANDOM: "RANDOM",
  SEQUENCE: "SEQUENCE",
};

/**
 *
 * @param {string} tpl
 */
const parseValues = (tpl) => {
  let id = 0;
  let template = tpl;
  let indexDiff = 0;
  const iterator = template.matchAll(/\{\{(RANDOM|SEQUENCE)(:\d+){0,2}\}\}/gi);
  const values = iterator.reduce((res, { 0: str, 1: type, index }) => {
    // replace value key with placeholder
    const placeholder = `{{${++id}}}`;
    template =
      template.substring(0, index + indexDiff) +
      placeholder +
      template.substring(index + indexDiff + str.length, template.length);

    indexDiff += placeholder.length - str.length;

    // extract value params and save
    const [param1, param2] = str.match(/(?<=:)(\d+)/gi) || [];
    const config = {};

    switch (type) {
      case "RANDOM":
        config.type = ValueType.RANDOM;
        config.min = 0;
        config.max = Number.MAX_SAFE_INTEGER;

        if (param2) {
          config.min = Number(param1) || 0;
          config.max = Number(param2) || Number.MAX_SAFE_INTEGER;
        } else if (param1) {
          config.max = Number(param1) || Number.MAX_SAFE_INTEGER;
        }
        break;
      case "SEQUENCE":
        config.type = ValueType.SEQUENCE;
        config.index = 1;
        config.step = 1;

        if (param2) {
          config.index = Number(param1) || 1;
          config.step = Number(param2) || 1;
        } else if (param1) {
          config.index = Number(param1) || 1;
        }
        break;
      default:
        console.error(
          `Unexpected template value "${str}", could not process it.`
        );
        return res;
    }

    return {
      ...res,
      [placeholder]: config,
    };
  }, {});

  return { template, values };
};

const prepareEventBody = (tpl, values) => {
  const body = Object.entries(values).reduce((res, [key, config]) => {
    switch (config.type) {
      case ValueType.RANDOM:
        const { min, max } = config;
        const value = Math.round(min + Math.random() * (max - min));
        res = res.replace(key, String(value));
        break;
      case ValueType.SEQUENCE:
        const { index, step } = config;
        res = res.replace(key, String(index));
        config.index += step;
        break;
      default:
        break;
    }
    return res;
  }, tpl);

  // to confirm it is a valid JSON before sending it to content script.
  return JSON.parse(body);
};

function sendEventFn(url, body) {
  return fetch(url, {
    body,
    method: "POST",
  })
    .then((response) =>
      response
        .json()
        .then((data) => ({
          status: response.status,
          statusText: response.statusText,
          response: data,
        }))
        .catch((error) => ({
          status: response.status,
          statusText: response.statusText,
          response: null,
          errorMessage: error.message,
        }))
    )
    .catch((error) => ({
      status: "0",
      statusText: "Unable to send request.",
      response: null,
      errorMessage: error.message,
    }));
}

function EventRunner() {
  const frameRef = useRef(null);
  const [event, setEvent] = useState(null);
  const [values, setValues] = useState({});
  const [frameLoaded, setFrameLoaded] = useState(false);

  useEffect(() => {
    try {
      const str = decodeURIComponent(window.location.hash.substr(1));
      const data = JSON.parse(str);

      const { template, values } = parseValues(data.template);
      data.template = template;

      frameRef.current.addEventListener("load", () => {
        setFrameLoaded(true);
      });

      frameRef.current.src = data.env;

      setValues(values);
      setEvent(data);
    } catch (error) {
      // silent error, UI never initializes
    }
  }, []);

  const handleExecute = useCallback(async () => {
    let eventBody = {};

    try {
      const { env, template, urlQuery } = event;
      // mutate value configs, that's fine(house_in_fire.png)
      eventBody = prepareEventBody(template, values);

      const url = urlQuery ? `${env}?${urlQuery}` : env;

      const [{ result }] = await chrome.tabs.getCurrent().then((tab) => {
        return chrome.webNavigation
          .getAllFrames({ tabId: tab.id })
          .then(([frame]) =>
            chrome.scripting.executeScript({
              target: { tabId: tab.id, frameIds: [frame.frameId] },
              func: sendEventFn,
              args: [url, JSON.stringify(eventBody)],
            })
          );
      });

      return {
        eventBody,
        result,
      };
    } catch (error) {
      return {
        eventBody,
        result: {
          status: "0",
          statusText: "Could not retrieve an execution context.",
          response: null,
          errorMessage: error.message,
        },
      };
    }
  }, [event, values]);

  return (
    <CssVarsProvider>
      <CssBaseline />
      <div className="App">
        {event && frameLoaded ? (
          <RunList event={event} onExecute={handleExecute} />
        ) : (
          <NotAvailable />
        )}
      </div>
      <iframe
        ref={frameRef}
        id="event-runner-frame"
        width={256}
        height={256}
        title="Context for sending events"
        style={{
          position: "absolute",
          zIndex: "-1",
          top: -300,
          left: -300,
        }}
      ></iframe>
    </CssVarsProvider>
  );
}

export default EventRunner;
