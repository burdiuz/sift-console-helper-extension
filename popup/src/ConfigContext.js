import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const { chrome } = window;

export const ConfigContext = createContext(null);

const requestConfig = () =>
  chrome.runtime.sendMessage({ type: "get-config-data" });

export const ConfigContextProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const requestAndSaveConfig = () => {
      requestConfig().then((data) => {
        if (data) {
          setConfig(data);
          console.log("Config data:", data);
        } else {
          // half a second should be more than enough for a message exchange
          setTimeout(requestAndSaveConfig, 500);
        }
      });
    };

    requestAndSaveConfig();
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
