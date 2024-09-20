import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { List } from "./List";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getActiveTab, getTabRootUrl } from "extension/utils";
import {
  applyAuthSessionDump,
  dumpAuthSession,
  getAnalystInfo,
} from "extension/auth";
import { getStorageItem, setStorageItem } from "extension/storage";
import { go, getConfig } from "configs";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Textarea,
  Typography,
} from "@mui/joy";

const getAuthData = async () => {
  const tab = await getActiveTab();
  const host = getTabRootUrl(tab);
  const analyst = await getAnalystInfo(tab);
  const data = await dumpAuthSession(tab);
  const date = Date.now();

  return {
    id: date,
    name: analyst
      ? `${host} / ${go(analyst, getConfig().auths.analystNamePath)}`
      : host,
    date,
    data,
  };
};

const STORAGE_KEY = "app-auth-sessions";

const getAuthsList = async () => {
  const {
    auths: { expireAfter },
  } = getConfig();
  let list = await getStorageItem(STORAGE_KEY);

  if (!list) {
    list = [];
  }

  return list.filter(({ date }) => date > Date.now() - expireAfter);
};

// TODO Add auto cleaning algorithm that will delete all logins older than 7 days
export const AuthView = () => {
  const [list, setList] = useState([]);
  const [description, setDescription] = useState("");
  const [jsonText, setJsonText] = useState("");

  const isValidJson = useMemo(() => {
    try {
      const json = JSON.parse(jsonText);
      return json.date && json.id && json.name && json.data;
    } catch (err) {
      return false;
    }
  }, [jsonText]);

  const reloadList = useCallback(async () => {
    const list = await getAuthsList();

    setList(list || []);
    // setList([{ "name":"auth session mock", "id":1726600000000, "date": 1726681802924, "data":{"test_me": "abc-123"}}]);
  }, []);

  const handleStore = useCallback(async () => {
    const item = await getAuthData();
    item.description = description;

    let list = await getAuthsList();

    list = [item, ...list].sort((a, b) => (a.date < b.date ? 1 : -1));

    await setStorageItem(STORAGE_KEY, list);

    setDescription("");
    reloadList();
  }, [description]);

  const handleApply = useCallback(async (item) => {
    const tab = await getActiveTab();
    await applyAuthSessionDump(tab, item.data);
  }, []);

  const handleRemove = useCallback(async ({ id }) => {
    const list = await getAuthsList();

    await setStorageItem(
      STORAGE_KEY,
      list.filter((item) => item.id !== id)
    );

    reloadList();
  }, []);

  const handleImport = async () => {
    const item = JSON.parse(jsonText);
    let list = await getAuthsList();

    list = [item, ...list].sort((a, b) => (a.date < b.date ? 1 : -1));

    await setStorageItem(STORAGE_KEY, list);

    setJsonText("");
    reloadList();
  };

  useEffect(() => {
    reloadList();
  }, []);

  return (
    <Box>
      <AccordionGroup>
        <Accordion>
          <AccordionSummary>Add Auth session manually</AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", gap: "8px" }}>
              <Input
                placeholder="Authentication session description"
                sx={{ flex: 1 }}
                value={description}
                onChange={({ currentTarget: { value } }) =>
                  setDescription(value)
                }
              />{" "}
              <Button onClick={handleStore} title="Store Auth session from current tab">Store auth</Button>
            </Box>
            <Typography>Import JSON of an Auth session</Typography>
            <Textarea
              minRows={5}
              placeholder='Place Auth session JSON here and hit "Import" button'
              value={jsonText}
              onChange={({ currentTarget: { value } }) => setJsonText(value)}
            ></Textarea>
            <Button
              disabled={!isValidJson}
              title="Import provided JSON content as an Auth session"
              sx={{ alignSelf: "flex-end", marginTop: "8px" }}
              onClick={handleImport}
            >
              Import
            </Button>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
      <List list={list} onApply={handleApply} onRemove={handleRemove} />
    </Box>
  );
};
