import { getConfig } from "configs";

export const Environments = getConfig().events.urls;

export const Sender = {
  BROWSER: "$browser",
  APP: "$app",
};

export const Runner = {
  WINDOW: "window",
  TAB: "tab",
};