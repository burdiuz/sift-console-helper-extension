import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const { chrome } = window;

export const ConfigContext = createContext(null);

export const ConfigContextProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "get-config-data" }).then((data) => {
      setConfig(data);
      console.log("Config data:", data);
    });
  }, []);

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export const go = (target, path) =>
  path.split(".").reduce((target, key) => target?.[key], target);

export const useConfigContext = () => useContext(ConfigContext);

export const useConfig = () => {
  const config = useConfigContext();

  const getConfig = useCallback(() => config, [config]);

  return {
    getConfig,
  };
};
