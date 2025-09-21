import { useCallback, useEffect, useState } from "react";
import { EventList } from "./EventList";
import { EventJsonEditor } from "./EventJsonEditor";
import { Runner } from "./utils";
import { getStorageItem, setStorageItem } from "extension/storage";
import { useConfig } from "ConfigContext";

const { chrome } = window;

const STORAGE_KEY = "ce-send-events";

const prepareEvent = (event, mixins) => {
  const { template, values } = event;
  const newEvent = {
    ...event,
    mixin: mixins?.[event.selectedMixin] || {},
  };

  newEvent.template = Object.entries(values).reduce(
    (tpl, [key, value]) =>
      tpl.replace(new RegExp(`\\{\\{${key}(:.*)?\\}\\}`), value),
    template
  );

  // delete parameters not used for sending
  delete newEvent.values;
  delete newEvent.allowMixins;
  delete newEvent.selectedMixin;

  return newEvent;
};

export const EventsView = () => {
  const { getConfig } = useConfig();
  const [list, setList] = useState([]);
  const [options, setOptions] = useState(null);

  const reloadList = useCallback(async () => {
    const list = await getStorageItem(STORAGE_KEY);

    setList(list || []);
  }, []);

  const handleContinue = useCallback((event) => {
    setOptions(event);
  }, []);

  const handleDuplicate = useCallback((event) => {
    const newEvent = { ...event };
    delete newEvent.id;

    setOptions(newEvent);
  }, []);

  const handleRemove = useCallback(async (id) => {
    const list = (await getStorageItem(STORAGE_KEY)) || [];

    await setStorageItem(
      STORAGE_KEY,
      list.filter((item) => item.id !== id)
    );

    reloadList();
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

    const mixins = getConfig().events.mixins;
    event = prepareEvent(event, mixins);

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

  const handleSave = async ({ template, description }) => {
    const list = (await getStorageItem(STORAGE_KEY)) || [];

    if (options.id) {
      await setStorageItem(
        STORAGE_KEY,
        list.map((item) => {
          if (item.id !== options.id) {
            return item;
          }

          return {
            ...options,
            description,
            template,
          };
        })
      );
    } else {
      const result = {
        ...options,
        id: Date.now(),
        description,
        template,
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
      options={options}
      onSave={handleSave}
      onCancel={() => setOptions(null)}
    />
  ) : (
    <EventList
      list={list}
      onEdit={handleContinue}
      onRemove={handleRemove}
      onDuplicate={handleDuplicate}
      onContinue={handleContinue}
      onSend={handleSend}
    />
  );
};
