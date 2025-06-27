export class LeaderboardPlayer {
  public constructor(
    private readonly rank: number,
    private readonly name: string,
    private readonly score: number,
    private readonly profileLink: string,
    private readonly profileImageLink: string
  ) {}
}

export class Player {}
