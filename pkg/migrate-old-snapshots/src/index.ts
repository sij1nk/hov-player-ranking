import process from "node:process";

type PlayerJson = {
	Rank: string;
	Player: string;
	["Total rank"]: string;
	["Pvp rank"]: string;
	["Total score"]: string;
	["Pvp score"]: string;
	["Score ratio"]: string;
};

enum SteamIdType {
	ID = "ID",
	CUSTOM = "CUSTOM",
}

type Player = {
	rank: number;
	steamId: string;
	steamIdType: SteamIdType;
	name: string;
	stats: PlayerStats;
};

type PlayerStats = {
	totalRank?: number;
	totalScore?: number;
	pvpRank?: number;
	pvpScore?: number;
	scoreRatioMin: number;
	scoreRatioMax: number;
};

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
const players: PlayerJson[] = JSON.parse(json);
console.log(players);
