const defaultSteamProfileImageId = "fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb";
const origin = "https://avatars.akamai.steamstatic.com";

export function getProfileImageUrl(profileImageId: string | null): string {
  return `${origin}/${profileImageId ?? defaultSteamProfileImageId}.jpg`;
}

export function getProfileImageUrlLarge(profileImageId: string | null): string {
  return `${origin}/${profileImageId ?? defaultSteamProfileImageId}_full.jpg`;
}
