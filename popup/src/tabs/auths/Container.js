import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tabs from "@mui/joy/Tabs";
import { List } from "./List";
import { Sections } from "./Sections";

const TabKeys = {
  DATES: "dates",
  HOSTS: "hosts",
};

export const Container = ({ list, onApply, onRemove }) => {
  const defaultTab =
    localStorage.getItem("auths-tab-current-sub-tab") || TabKeys.DATES;

  return (
    <>
      <Tabs
        defaultValue={defaultTab}
        onChange={(_, newTab) =>
          localStorage.setItem("auths-tab-current-sub-tab", newTab)
        }
      >
        <TabList>
          <Tab value={TabKeys.DATES}>Dates</Tab>
          <Tab value={TabKeys.HOSTS}>Hosts</Tab>
        </TabList>
        <TabPanel value={TabKeys.DATES}>
          <List list={list} onApply={onApply} onRemove={onRemove} />
        </TabPanel>
        <TabPanel value={TabKeys.HOSTS}>
          <Sections list={list} onApply={onApply} onRemove={onRemove} />
        </TabPanel>
      </Tabs>
    </>
  );
};
