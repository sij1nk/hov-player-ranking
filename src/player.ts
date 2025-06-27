export type PlayerCommon = {
  name: string;
  profileLink: string;
  profileImageLink: string;
};

export type LeaderboardPlayer = PlayerCommon & {
  rank: number;
  score: number;
};

export type Player = PlayerCommon & {
  totalRank?: number;
  pvpRank?: number;
  totalScore?: number;
  pvpScore?: number;
  scoreRatio?: number;
};

export type PlayerMarkdownEntry = {
  i: number;
  nameAsLink: string;
  totalRank?: number;
  pvpRank?: number;
  totalScore?: number;
  pvpScore?: number;
  scoreRatio?: number;
};

export function playerToMarkdownEntry(
  p: Player,
  i: number
): PlayerMarkdownEntry {
  return {
    i,
    nameAsLink: `<a href="${p.profileLink}">${p.name}</a>`,
    totalRank: p.totalRank,
    pvpRank: p.pvpRank,
    totalScore: p.totalScore,
    pvpScore: p.pvpScore,
    scoreRatio: p.scoreRatio,
  };
}

export function playerComparator(p1: Player, p2: Player): number {
  if (!p1.scoreRatio) return 1;
  if (!p2.scoreRatio) return -1;
  return p2.scoreRatio - p1.scoreRatio;
}

function fromPvpOnlyPlayer(player: LeaderboardPlayer): Player {
  return {
    name: player.name,
    profileLink: player.profileLink,
    profileImageLink: player.profileImageLink,
    pvpRank: player.rank,
    pvpScore: player.score,
  };
}

function fromTotalOnlyPlayer(player: LeaderboardPlayer): Player {
  return {
    name: player.name,
    profileLink: player.profileLink,
    profileImageLink: player.profileImageLink,
    totalRank: player.rank,
    totalScore: player.score,
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
    scoreRatio: Number((pvpPlayer.score / totalPlayer.score).toFixed(3)),
  };
}

export function getPlayerList(
  totalScoreLeaderboardPlayers: LeaderboardPlayer[],
  pvpScoreLeaderboardPlayers: (LeaderboardPlayer | null)[]
): Player[] {
  const players = [];

  for (const player of totalScoreLeaderboardPlayers) {
    const pvpPlayerIndex = pvpScoreLeaderboardPlayers.findIndex(
      (p) => p?.name === player.name
    );
    if (pvpPlayerIndex < 0) {
      players.push(fromTotalOnlyPlayer(player));
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
      .map(fromPvpOnlyPlayer)
  );

  return players;
}
