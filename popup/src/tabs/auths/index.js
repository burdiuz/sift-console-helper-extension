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
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Textarea,
  Typography,
} from "@mui/joy";
import { go, useConfig } from "ConfigContext";
import { Container } from "./Container";

const getAuthData = async (config) => {
  const tab = await getActiveTab();
  const host = getTabRootUrl(tab);
  const analyst = await getAnalystInfo(tab);
  const data = await dumpAuthSession(tab, config.auths.authStateKeys);
  const date = Date.now();

  return {
    id: date,
    host,
    //name: analyst ? `${host} / ${go(analyst, config.auths.analystNamePath)}` : host,
    name: analyst
      ? go(analyst, config.auths.analystNamePath)
      : "Unknown analyst",
    date,
    data,
  };
};

const STORAGE_KEY = "app-auth-sessions";

const getAuthsList = async (config) => {
  let list = await getStorageItem(STORAGE_KEY);

  if (!list) {
    list = [];
  }

  const { expireAfter } = config.auths;

  return expireAfter
    ? list.filter(({ date }) => date > Date.now() - config.auths.expireAfter)
    : list;
};

// TODO Add auto cleaning algorithm that will delete all logins older than 7 days
export const AuthView = () => {
  const { getConfig } = useConfig();
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
    //*
    const list = await getAuthsList(getConfig());

    setList(list || []);
    //*/
    /*
    setList([
      {
        name: "auth session mock 1",
        host: "https://mui.com",
        id: 1726600000000,
        date: 1726681802924,
        data: { test_me: "abc-123" },
      },
      {
        name: "auth session mock 2",
        id: 1726600000000,
        date: 1726681802925,
        data: { test_me: "abc-123" },
      },
      {
        name: "auth session mock 3",
        host: "https://www.youtube.com",
        id: 1726600000000,
        date: 1726681802926,
        data: { test_me: "abc-123" },
      },
      {
        name: "auth session mock 4",
        host: "https://github.com",
        id: 1726600000000,
        date: 1726681802927,
        data: { test_me: "abc-123" },
      },
      {
        name: "auth session mock 5",
        host: "https://github.com",
        id: 1726600000000,
        date: 1726681802928,
        data: { test_me: "abc-123" },
      },
      {
        name: "auth session mock 6",
        host: "https://www.youtube.com",
        id: 1726600000000,
        date: 1726681802929,
        data: { test_me: "abc-123" },
      },
    ]);
    //*/
  }, []);

  const handleStore = useCallback(async () => {
    const item = await getAuthData(getConfig());
    item.description = description;

    let list = await getAuthsList(getConfig());

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
    const list = await getAuthsList(getConfig());

    await setStorageItem(
      STORAGE_KEY,
      list.filter((item) => item.id !== id)
    );

    reloadList();
  }, []);

  const handleImport = async () => {
    const item = JSON.parse(jsonText);
    let list = await getAuthsList(getConfig());

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
              <Button
                onClick={handleStore}
                title="Store Auth session from current tab"
              >
                Store auth
              </Button>
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
      <Container list={list} onApply={handleApply} onRemove={handleRemove} />
    </Box>
  );
};
