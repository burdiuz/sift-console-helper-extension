import "./App.css";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tab from "@mui/joy/Tab";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import "@fontsource/inter";
import { AuthView } from "./tabs/auths";
import { FFOverridesView } from "./tabs/ff-overrides";
import { EventsView } from "./tabs/events";
import { SpoofingView } from "./tabs/spoofing";
import { AccountView } from "./tabs/account";
import { AppDumpView } from "./tabs/app-dump";
import { LockStateView } from "./tabs/lock-state";
import { MixpanelView, MixpanelIcon } from "./tabs/mixpanel";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SettingsIcon from "@mui/icons-material/Settings";
import { SnackbarsProvider } from "shared/Snackbars";
import { useEffect, useMemo, useState } from "react";
import { Typography } from "@mui/joy";
import { getActiveTab, getTabRootUrl } from "extension/utils";
import { SettingsView } from "tabs/settings";
import { ConfirmationText } from "tabs/settings/ConfirmationText";
import { ConfigContextProvider, useConfigContext } from "ConfigContext";

const { chrome } = window;

const TabKeys = {
  AUTH: "auth",
  FF_OVERRIDES: "ff-overrides",
  EVENTS: "events",
  SPOOFING: "spoofing",
  ACCOUNT: "account",
  APP_DUMP: "app-state-dump",
  LOCK_STATE: "lock-state",
  MIXPANEL: "mixpanel",
  SETTINGS: "settings",
};

const AppContent = ({ tabId }) => {
  const defaultTab =
    localStorage.getItem("app-main-navigation-current-tab") || TabKeys.AUTH;

  return (
    <Tabs
      defaultValue={defaultTab}
      onChange={(event, newTab) =>
        localStorage.setItem("app-main-navigation-current-tab", newTab)
      }
    >
      <Box sx={{ display: "flex" }}>
        <TabList sx={{ flex: 1 }}>
          <Tab value={TabKeys.AUTH}>Auth</Tab>
          <Tab value={TabKeys.FF_OVERRIDES}>Local FFs</Tab>
          <Tab value={TabKeys.EVENTS}>Events</Tab>
          <Tab value={TabKeys.LOCK_STATE}>Lock State</Tab>
          <Tab value={TabKeys.SPOOFING} sx={{ display: "none" }}>
            Spoofing
          </Tab>
          <Tab value={TabKeys.ACCOUNT} sx={{ display: "none" }}>
            Account
          </Tab>
          <Tab value={TabKeys.APP_DUMP}>Dump</Tab>
          <Tab value={TabKeys.MIXPANEL}>
            <MixpanelIcon />
          </Tab>
          <Tab value={TabKeys.SETTINGS}>
            <SettingsIcon />
          </Tab>
        </TabList>
        {window.location.hash.length > 1 ? (
          <Button
            variant="plain"
            size="sm"
            onClick={() => {
              getActiveTab().then((tab) => {
                chrome.tabs.highlight({
                  tabs: [tab.index],
                  windowId: tab.windowId,
                });
              });
            }}
          >
            Highlight Tab
          </Button>
        ) : (
          <Button
            variant="plain"
            onClick={() => {
              const { action } = chrome.runtime.getManifest();
              const url = chrome.runtime.getURL(action.default_popup);

              chrome.windows.create({
                url: `${url}#${tabId}`,
                focused: true,
                setSelfAsOpener: true,
                type: "panel", // "popup"
                width: 800,
                height: 600,
              });

              window.close();
            }}
          >
            <OpenInNewIcon />
          </Button>
        )}
      </Box>
      <TabPanel value={TabKeys.AUTH}>
        <AuthView />
      </TabPanel>
      <TabPanel value={TabKeys.FF_OVERRIDES}>
        <FFOverridesView />
      </TabPanel>
      <TabPanel value={TabKeys.EVENTS}>
        <EventsView />
      </TabPanel>
      <TabPanel value={TabKeys.SPOOFING}>
        <SpoofingView />
      </TabPanel>
      <TabPanel value={TabKeys.ACCOUNT}>
        <AccountView />
      </TabPanel>
      <TabPanel value={TabKeys.APP_DUMP}>
        <AppDumpView />
      </TabPanel>
      <TabPanel value={TabKeys.LOCK_STATE}>
        <LockStateView tabId={tabId} />
      </TabPanel>
      <TabPanel value={TabKeys.MIXPANEL}>
        <MixpanelView />
      </TabPanel>
      <TabPanel value={TabKeys.SETTINGS}>
        <SettingsView />
      </TabPanel>
    </Tabs>
  );
};

const NotAvailable = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "600px",
    }}
  >
    <Typography>Target Tab is no longer available.</Typography>
  </Box>
);
const ReadingConfig = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "600px",
    }}
  >
    <Typography>Reading extension config...</Typography>
  </Box>
);

const Confirmation = ({ onConfirm }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "600px",
      padding: "25px",
      gap: "8px",
    }}
  >
    <ConfirmationText />
    <Button onClick={onConfirm}>Proceed</Button>
  </Box>
);

const HASH_TAB_ID = Number(window.location.hash.substr(1));

const AppWrapper = ({ children }) => (
  <CssVarsProvider>
    <CssBaseline />
    <ConfigContextProvider>
      <div className="App">
        <SnackbarsProvider>{children}</SnackbarsProvider>
      </div>
    </ConfigContextProvider>
  </CssVarsProvider>
);

const AppInitChecks = ({ onComplete }) => {
  const [tabId, setTabId] = useState();
  const configReady = !!useConfigContext();
  const [tabAvailable, setTabAvailable] = useState(true);
  const [confirmed, setConfirmed] = useState(
    () => !!localStorage.getItem("confirmed-to-proceed")
  );

  useEffect(() => {
    if (tabId && configReady && tabAvailable && confirmed) {
      onComplete(tabId);
    }
  }, [tabId, configReady && tabAvailable && confirmed]);

  useEffect(() => {
    if (!HASH_TAB_ID) {
      getActiveTab().then((tab) => setTabId(tab.id));
      setTabAvailable(true);
      return;
    }

    // tab was closed
    const removedListener = (tabId) => {
      if (tabId === HASH_TAB_ID) {
        setTabAvailable(false);
      }
    };

    // test if tab is available
    chrome.tabs
      ?.get(HASH_TAB_ID)
      .then((tab) => {
        setTabId(HASH_TAB_ID);
        setTabAvailable(true);

        document.querySelector(
          "html > head > title"
        ).textContent = `Console Helper for ${getTabRootUrl(tab)}`;
      })
      .catch(() => setTabAvailable(false));
    chrome.tabs?.onRemoved.addListener(removedListener);

    return () => {
      chrome.tabs?.onRemoved.removeListener(removedListener);
    };
  }, []);

  if (!configReady) {
    return <ReadingConfig />;
  }

  if (!tabAvailable) {
    return <NotAvailable />;
  }

  if (!confirmed) {
    return (
      <Confirmation
        onConfirm={() => {
          localStorage.setItem("confirmed-to-proceed", "1");
          setConfirmed(true);
        }}
      />
    );
  }

  return null;
};

const App = () => {
  const detatched = useMemo(() => !!HASH_TAB_ID, []);
  const [tabId, setTabId] = useState();

  return (
    <AppWrapper>
      {tabId ? (
        <AppContent tabId={tabId} detatched={detatched} />
      ) : (
        <AppInitChecks onComplete={(value) => setTabId(value)} />
      )}
    </AppWrapper>
  );
};

export default App;
