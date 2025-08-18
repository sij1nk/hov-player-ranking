import util from "node:util";

export enum SteamIdType {
  Id = "ID",
  Custom = "CUSTOM",
}

type PlayerSecondaryId = {
  steamId: string;
  // TODO: is a string due to incompability between SteamIdType (my enum)
  // and SteamIdType (the prisma-generated one which is an object)
  steamIdType: string;
};

export function isSamePlayer(
  left: PlayerSecondaryId,
  right: PlayerSecondaryId
): boolean {
  return (
    left.steamId === right.steamId && left.steamIdType === right.steamIdType
  );
}

export function getDateShort(date: Date): string {
  return util.format(
    "%s-%s-%s-%s",
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCHours()).padStart(2, "0")
  );
}
