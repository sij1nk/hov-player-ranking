import fetch from "node-fetch";
import { parse } from "node-html-parser";
import process from "node:process";

const result = await fetch(
  "https://steamcommunity.com/stats/2504090/leaderboards/16808192?sr=1"
);
const text = await result.text();
const root = parse(text);
const stats = root.querySelector("#stats");
if (!stats) {
  console.error("no stats");
  process.exit(1);
}

const first = stats.querySelectorAll(".lbentry")[0];
const pname = first.querySelector(".playerName")?.innerText;
console.log(pname);
