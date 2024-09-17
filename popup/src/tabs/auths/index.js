import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { List } from "./List";
import { useCallback, useEffect, useState } from "react";
import { getActiveTab, getTabRootUrl } from "extension/utils";
import {
  applyAuthSessionDump,
  dumpAuthSession,
  getAnalystInfo,
} from "extension/auth";
import { getStorageItem, setStorageItem } from "extension/storage";
import { go, getConfig } from "configs";

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

// TODO Add auto cleaning algorithm that will delete all logins older than 7 days
export const AuthView = () => {
  const [list, setList] = useState([]);
  const [description, setDescription] = useState("");

  const reloadList = useCallback(async () => {
    const list = await getStorageItem(STORAGE_KEY);

    setList(list || []);
  }, []);

  const handleStore = useCallback(async () => {
    const item = await getAuthData();
    item.description = description;

    let list = (await getStorageItem(STORAGE_KEY)) || [];

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
    const list = await getStorageItem(STORAGE_KEY);

    await setStorageItem(
      STORAGE_KEY,
      list.filter((item) => item.id !== id)
    );

    reloadList();
  }, []);

  useEffect(() => {
    reloadList();
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "8px" }}>
        <Input
          placeholder="Authentication session description"
          sx={{ flex: 1 }}
          value={description}
          onChange={({ currentTarget: { value } }) => setDescription(value)}
        />{" "}
        <Button onClick={handleStore}>Store auth</Button>
      </Box>
      <List list={list} onApply={handleApply} onRemove={handleRemove} />
    </Box>
  );
};
