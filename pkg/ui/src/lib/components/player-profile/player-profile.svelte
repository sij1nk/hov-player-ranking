<script lang="ts">
  import SiSteam from "@icons-pack/svelte-simple-icons/icons/SiSteam";
  import { type Player } from "./player";
  import { getProfileImageUrlLarge } from "$lib/profile-image";
  import PlayerProfileLatestStats from "./player-profile-latest-stats.svelte";
  import Button from "../ui/button/button.svelte";
  import { SteamIdType } from "common";
  import PlayerProfileChart from "./player-profile-chart.svelte";
  type Props = {
    player: Player;
  };

  const steamProfileUrlStem = "https://steamcommunity.com";

  const getSteamProfileUrl = (steamId: string, steamIdType: SteamIdType): string =>
    `${steamProfileUrlStem}/${steamIdType === SteamIdType.Custom ? "id" : "profiles"}/${steamId}`;

  let { player }: Props = $props();
  let latestStats = $derived(player.stats.at(-1));
</script>

<div class="flex flex-row gap-2 pb-16 lg:gap-8">
  <div class="flex shrink-0 flex-col items-center gap-2">
    <img
      class="h-[164px] w-[164px] border-4"
      src={getProfileImageUrlLarge(player.profileImageId)}
      alt="Profile"
    />
    <Button
      href={getSteamProfileUrl(player.steamId, player.steamIdType)}
      class="align-end"
      variant="outline"><SiSteam /> View on Steam</Button
    >
  </div>
  <div class="flex flex-col items-start pt-2">
    <span class="pb-2 text-2xl lg:pb-8 lg:text-4xl">{player.name}</span>
    {#if latestStats}
      <PlayerProfileLatestStats stats={latestStats} />
    {/if}
  </div>
</div>

<div class="flex flex-col items-stretch gap-4 lg:gap-8">
  <PlayerProfileChart
    title="Score over time"
    stats={player.stats}
    domainMaxBoundFn={(stats) =>
      stats
        .map((s) => Math.max(s.totalScore ?? 0, s.pvpScore ?? 0))
        .filter((s): s is number => Boolean(s))
        .reduce((prev, curr) => (prev < curr ? curr : prev))}
    chartConfig={{
      totalScore: {
        label: "Total Score",
        color: "var(--accent2)",
      },
      pvpScore: {
        label: "PvP Score",
        color: "var(--chart-1)",
      },
    }}
  />

  <PlayerProfileChart
    title="Rank over time"
    stats={player.stats}
    domainMaxBoundFn={(stats) =>
      stats
        .map((s) => Math.max(s.pvpRank ?? 0, s.totalRank ?? 0))
        .filter((s): s is number => Boolean(s))
        .reduce((prev, curr) => (prev < curr ? curr : prev))}
    chartConfig={{
      totalRank: {
        label: "Total Rank",
        color: "var(--accent2)",
      },
      pvpRank: {
        label: "PvP Rank",
        color: "var(--chart-1)",
      },
    }}
  />
</div>
