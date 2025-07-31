import process from "node:process";
import type { PlayerJson } from "./types.ts";
import { playerJsonToPlayer } from "./convert.ts";

async function readStdin(): Promise<string> {
  return new Promise((res) => {
    const stdin = process.stdin;
    const chunks: string[] = [];

    stdin.on("readable", () => {
      let chunk;
      while (null !== (chunk = stdin.read())) {
        chunks.push(chunk);
      }
    });

    stdin.on("end", () => {
      const content = chunks.join("");
      res(content);
    });
  });
}

const json = await readStdin();
const jsonPlayers: PlayerJson[] = JSON.parse(json);
const players = jsonPlayers.map(playerJsonToPlayer);
console.log(players);
