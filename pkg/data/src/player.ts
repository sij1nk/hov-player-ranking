export type PlayerCommon = {
  name: string;
  steamId: string;
  steamIdType: SteamIdType;
  profileImageId: string;
};

export enum SteamIdType {
  Id = "ID",
  Custom = "CUSTOM",
}

export function getSteamIdType(pathSegment: string): SteamIdType | null {
  if (pathSegment === "id") return SteamIdType.Custom;
  if (pathSegment === "profiles") return SteamIdType.Id;
  return null;
}

export type LeaderboardPlayer = PlayerCommon & {
  rank: number;
  score: number;
};

type ScoreRatio =
  | {
      _type: "known";
      value: number;
    }
  | { _type: "unknown"; min: number; max: number };

export type Player = PlayerCommon & {
  totalRank?: number;
  pvpRank?: number;
  totalScore?: number;
  pvpScore?: number;
  scoreRatio: ScoreRatio;
};

export function playerComparator(p1: Player, p2: Player): number {
  return getPlayerMinimumScoreRatio(p2) - getPlayerMinimumScoreRatio(p1);
}

function getPlayerMinimumScoreRatio(p: Player): number {
  if (p.scoreRatio._type === "known") return p.scoreRatio.value;
  return p.scoreRatio.min;
}

function fromPvpOnlyPlayer(
  player: LeaderboardPlayer,
  maxTotalScore: number
): Player {
  const { rank, score, ...rest } = player;
  return {
    ...rest,
    pvpRank: rank,
    pvpScore: score,
    scoreRatio: { _type: "unknown", min: player.score / maxTotalScore, max: 1 },
  };
}

function fromTotalOnlyPlayer(
  player: LeaderboardPlayer,
  maxPvpScore: number
): Player {
  const { rank, score, ...rest } = player;
  return {
    ...rest,
    totalRank: rank,
    totalScore: score,
    scoreRatio: { _type: "unknown", min: 0, max: maxPvpScore / player.score },
  };
}

function fromPlayerOnBothLeaderboards(
  totalPlayer: LeaderboardPlayer,
  pvpPlayer: LeaderboardPlayer
): Player {
  const { rank, score, ...rest } = totalPlayer;
  return {
    ...rest,
    totalRank: rank,
    totalScore: score,
    pvpRank: pvpPlayer.rank,
    pvpScore: pvpPlayer.score,
    scoreRatio: { _type: "known", value: pvpPlayer.score / totalPlayer.score },
  };
}

export function getPlayerList(
  totalScoreLeaderboardPlayers: LeaderboardPlayer[],
  pvpScoreLeaderboardPlayers: (LeaderboardPlayer | null)[]
): Player[] {
  const players = [];

  const lowestTotalScore = totalScoreLeaderboardPlayers.at(-1)!.score;
  const lowestPvpScore = pvpScoreLeaderboardPlayers.at(-1)!.score;

  for (const player of totalScoreLeaderboardPlayers) {
    const pvpPlayerIndex = pvpScoreLeaderboardPlayers.findIndex(
      (p) => p?.name === player.name
    );
    if (pvpPlayerIndex < 0) {
      players.push(fromTotalOnlyPlayer(player, lowestPvpScore));
    } else {
      const pvpPlayer = pvpScoreLeaderboardPlayers.splice(
        pvpPlayerIndex,
        1,
        null
      )[0];
      if (!pvpPlayer) {
        throw new Error(
          `Tried to retrieve ${player.name} twice from pvp leaderboard`
        );
      }
      players.push(fromPlayerOnBothLeaderboards(player, pvpPlayer));
    }
  }

  players.push(
    ...pvpScoreLeaderboardPlayers
      .filter((p): p is LeaderboardPlayer => Boolean(p))
      .map((p) => fromPvpOnlyPlayer(p, lowestTotalScore))
  );

  return players;
}
