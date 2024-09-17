import { useCallback, useEffect, useState } from "react";
import { EventList } from "./EventList";
import { EventJsonEditor } from "./EventJsonEditor";
import { Runner } from "./utils";
import { getStorageItem, setStorageItem } from "extension/storage";

const { chrome } = window;

const STORAGE_KEY = "ce-send-events";

const prepareEvent = (event) => {
  const { template, values } = event;
  const newEvent = { ...event };

  newEvent.template = Object.entries(values).reduce(
    (tpl, [key, value]) =>
      tpl.replace(new RegExp(`\\{\\{${key}(:.*)?\\}\\}`), value),
    template
  );

  delete newEvent.values;

  return newEvent;
};

export const EventsView = () => {
  const [list, setList] = useState([]);
  const [options, setOptions] = useState(null);

  const reloadList = useCallback(async () => {
    const list = await getStorageItem(STORAGE_KEY);

    setList(list || []);
  }, []);

  const handleContinue = useCallback((event) => {
    setOptions(event);
  }, []);

  const handleSend = useCallback(async (event) => {
    // save event with send parameters except for custom template values
    const list = await getStorageItem(STORAGE_KEY);
    await setStorageItem(
      STORAGE_KEY,
      list.map((item) => {
        if (item.id !== event.id) {
          return item;
        }

        return { ...event, values: undefined };
      })
    );

    event = prepareEvent(event);

    const url = `${chrome.runtime.getURL(
      "./event-runner/index.html"
    )}#${encodeURIComponent(JSON.stringify(event))}`;

    if (event.runner === Runner.WINDOW) {
      chrome.windows.create({
        url,
        focused: true,
        setSelfAsOpener: true,
        type: "panel",
        width: 800,
        height: 600,
      });
    } else {
      chrome.tabs.create({
        url,
        active: true,
      });
    }
  }, []);

  const handleSave = async (code) => {
    const list = await getStorageItem(STORAGE_KEY) || [];

    if (options.id) {
      await setStorageItem(
        STORAGE_KEY,
        list.map((item) => {
          if (item.id !== options.id) {
            return item;
          }

          return {
            ...options,
            template: code,
          };
        })
      );
    } else {
      const result = {
        id: Date.now(),
        ...options,
        template: code,
      };

      await setStorageItem(STORAGE_KEY, [result, ...list]);
    }

    reloadList();
    setOptions(null);
  };

  useEffect(() => {
    reloadList();
  }, []);

  return options ? (
    <EventJsonEditor
      template={options.template}
      onSave={handleSave}
      onCancel={() => setOptions(null)}
    />
  ) : (
    <EventList
      list={list}
      onEdit={handleContinue}
      onContinue={handleContinue}
      onSend={handleSend}
    />
  );
};
