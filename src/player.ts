export type PlayerCommon = {
  name: string;
  profileLink: string;
  profileImageLink: string;
};

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

export type PlayerMarkdownEntry = {
  rank: number;
  player: string;
  totalRank?: number;
  pvpRank?: number;
  totalScore?: number;
  pvpScore?: number;
  scoreRatio?: string;
};

export function playerToMarkdownEntry(
  p: Player,
  i: number
): PlayerMarkdownEntry {
  return {
    rank: i + 1,
    player: `<a href="${p.profileLink}">${p.name}</a>`,
    totalRank: p.totalRank,
    pvpRank: p.pvpRank,
    totalScore: p.totalScore,
    pvpScore: p.pvpScore,
    scoreRatio:
      p.scoreRatio._type === "known"
        ? p.scoreRatio.value.toFixed(3)
        : `${p.scoreRatio.min.toFixed(3)} - ${p.scoreRatio.max.toFixed(3)}`,
  };
}

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
  return {
    name: player.name,
    profileLink: player.profileLink,
    profileImageLink: player.profileImageLink,
    pvpRank: player.rank,
    pvpScore: player.score,
    scoreRatio: { _type: "unknown", min: player.score / maxTotalScore, max: 1 },
  };
}

function fromTotalOnlyPlayer(
  player: LeaderboardPlayer,
  maxPvpScore: number
): Player {
  return {
    name: player.name,
    profileLink: player.profileLink,
    profileImageLink: player.profileImageLink,
    totalRank: player.rank,
    totalScore: player.score,
    scoreRatio: { _type: "unknown", min: 0, max: maxPvpScore / player.score },
  };
}

function fromPlayerOnBothLeaderboards(
  totalPlayer: LeaderboardPlayer,
  pvpPlayer: LeaderboardPlayer
): Player {
  return {
    name: totalPlayer.name,
    profileLink: totalPlayer.profileLink,
    profileImageLink: totalPlayer.profileImageLink,
    totalRank: totalPlayer.rank,
    totalScore: totalPlayer.score,
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
