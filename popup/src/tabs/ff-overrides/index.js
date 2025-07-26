import Box from "@mui/joy/Box";
import { useCallback, useEffect, useState } from "react";
import { NewItem } from "./NewItem";
import { List } from "./List";
import { getActiveTab } from "extension/utils";
import { getAccountInfo } from "extension/auth";
import { go, useConfig } from "ConfigContext";

const { chrome } = window;
const getLSKey = (config) => config.ffOverrides.overridesKey;

const getFFOverrides = (tab, config) =>
  new Promise((resolve, reject) => {
    function injectedFn(key) {
      return JSON.parse(localStorage.getItem(key) || "{}");
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
        args: [getLSKey(config)],
      })
      .then(([{ result }]) => resolve(result))
      .catch(reject);
  });

const setFFOverrides = (tab, config, overrides) =>
  new Promise((resolve, reject) => {
    function injectedFn(key, overrides) {
      if (!Object.keys(overrides).length) {
        localStorage.removeItem(key);
        return;
      }

      localStorage.setItem(key, JSON.stringify(overrides));
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectedFn,
        args: [getLSKey(config), overrides],
      })
      .then(() => resolve())
      .catch(reject);
  });

const getFeatureFlags = async (config) => {
  const tab = await getActiveTab();
  const account = await getAccountInfo(tab);
  const overrides = await getFFOverrides(tab, config);
  const values = go(account, config.ffOverrides.propertyPath) || {};

  return { values, overrides };
};

export const FFOverridesView = () => {
  const { getConfig } = useConfig();
  const [values, setValues] = useState({});
  const [overrides, setOverrides] = useState({});

  const update = useCallback(async (overrides) => {
    const tab = await getActiveTab();
    await setFFOverrides(tab, getConfig(), overrides);
    const updatedOverrides = await getFFOverrides(tab, getConfig());

    setOverrides(updatedOverrides);
  }, []);

  const handleClear = useCallback((name) => {
    setOverrides((overrides) => {
      const newOverrides = { ...overrides };
      delete newOverrides[name];

      update(newOverrides);

      return newOverrides;
    });
  }, []);

  const handleOverride = useCallback(
    (name, value) => {
      if (name in values && values[name] === value) {
        handleClear(name);
        return;
      }

      setOverrides((overrides) => {
        const newOverrides = {
          ...overrides,
          [name]: value,
        };

        update(newOverrides);

        return newOverrides;
      });
    },
    [values]
  );

  const handleClearAll = useCallback(() => {
    update({});
  }, []);

  useEffect(() => {
    getFeatureFlags(getConfig()).then(({ values, overrides }) => {
      setValues(values);
      setOverrides(overrides);
    });
  }, []);

  return (
    <Box>
      <NewItem onAdd={handleOverride} />
      <List
        values={values}
        overrides={overrides}
        onOverride={handleOverride}
        onClear={handleClear}
        onClearAll={handleClearAll}
      />
    </Box>
  );
};
