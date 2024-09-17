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
import { ApiCallsView } from "./tabs/api-calls";
import { MixpanelView, MixpanelIcon } from "./tabs/mixpanel";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { SnackbarsProvider } from "shared/Snackbars";
import { useEffect, useState } from "react";
import { Typography } from "@mui/joy";
import { getActiveTab } from "extension/utils";

const { chrome } = window;

const TabKeys = {
  AUTH: "auth",
  FF_OVERRIDES: "ff-overrides",
  EVENTS: "events",
  SPOOFING: "spoofing",
  ACCOUNT: "account",
  APP_DUMP: "app-state-dump",
  API_CALLS: "api-calls",
  MIXPANEL: "mixpanel",
};

const AppContent = ({ tabId }) => (
  <Tabs defaultValue={TabKeys.AUTH}>
    <Box sx={{ display: "flex" }}>
      <TabList sx={{ flex: 1 }}>
        <Tab value={TabKeys.AUTH}>Auth</Tab>
        <Tab value={TabKeys.FF_OVERRIDES}>Local FFs</Tab>
        <Tab value={TabKeys.EVENTS}>Events</Tab>
        <Tab value={TabKeys.API_CALLS} sx={{ display: "none" }}>
          API
        </Tab>
        <Tab value={TabKeys.SPOOFING} sx={{ display: "none" }}>Spoofing</Tab>
        <Tab value={TabKeys.ACCOUNT} sx={{ display: "none" }}>Account</Tab>
        <Tab value={TabKeys.APP_DUMP}>Dump</Tab>
        <Tab value={TabKeys.MIXPANEL}>
          <MixpanelIcon />
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
    <TabPanel value={TabKeys.API_CALLS}>
      <ApiCallsView />
    </TabPanel>
    <TabPanel value={TabKeys.MIXPANEL}>
      <MixpanelView />
    </TabPanel>
  </Tabs>
);

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

function App() {
  const [tabAvailable, setTabAvailable] = useState(true);
  const [tabId, setTabId] = useState();

  useEffect(() => {
    const searchTabId = new URLSearchParams(window.location.search).get(
      "tabId"
    );
    const removedListener = (tabId) => {
      if (tabId === searchTabId) {
        setTabAvailable(false);
      }
    };

    if (searchTabId) {
      // test if tab is available
      chrome.tabs?.get(searchTabId).catch(() => setTabAvailable(false));
      chrome.tabs?.onRemoved.addListener(removedListener);
      setTabId(searchTabId);
    } else {
      getActiveTab().then((tab) => setTabId(tab.id));
    }

    return () => {
      chrome.tabs?.onRemoved.removeListener(removedListener);
    };
  }, []);

  return (
    <CssVarsProvider>
      <CssBaseline />
      <div className="App">
        <SnackbarsProvider>
          {tabAvailable ? <AppContent tabId={tabId} /> : <NotAvailable />}
        </SnackbarsProvider>
      </div>
    </CssVarsProvider>
  );
}

export default App;
