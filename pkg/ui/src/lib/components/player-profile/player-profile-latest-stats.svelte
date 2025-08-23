<script lang="ts">
  import type { PlayerStats } from "./player";
  import CircleHelp from "@lucide/svelte/icons/circle-help";
  import * as Popover from "$lib/components/ui/popover/index.js";

  type Props = {
    stats: PlayerStats;
  };

  let { stats }: Props = $props();
</script>

{#snippet row(title: string, score: number | null, rank: number | null, i: number)}
  <span class="row-{i} col-1">{title}</span>
  <span class="row-{i} col-2 text-lg">
    {score?.toLocaleString() ?? "unknown"}
    {#if rank}
      <span class="text-sm opacity-50">{`(#${rank})`}</span>
    {/if}
  </span>
{/snippet}

<div class="grid auto-cols-auto auto-rows-auto items-center gap-x-2">
  {@render row("PvP Score", stats.pvpScore, stats.pvpRank, 1)}
  {@render row("Total Score", stats.totalScore, stats.totalRank, 2)}
  <span class="col-1 row-3">Score ratio</span>
  <div class="col-2 row-3 flex flex-row items-center gap-2">
    {#if stats.scoreRatioMin === stats.scoreRatioMax}
      <span class="py-0 text-lg">{stats.scoreRatioMin.toFixed(3)}</span>
    {:else}
      <span class="py-0 text-lg">
        {stats.scoreRatioMin.toFixed(3)} <span class="text-md opacity-50">-</span>
        {stats.scoreRatioMax.toFixed(3)}</span
      >
    {/if}
    <Popover.Root>
      <Popover.Trigger class="cursor-pointer opacity-50">
        <CircleHelp size="16" />
      </Popover.Trigger>
      <Popover.Content class="w-screen text-sm lg:w-120">
        <p>
          Your <span class="text-(--accent)">Score Ratio</span>
          is your <span class="text-(--accent)">PvP Score</span>
          divided by your <span class="text-(--accent)">Total Score</span>.
        </p>
        <br />
        <p>
          A higher number indicates that the player mostly plays against other players; a low number
          means the player primarily plays against bots, or gains score from other non-PvP sources
          (e.g. hosting servers).
        </p>
        <br />
        <p>
          The official leaderboards only show 200 entries each. For players who are not on both
          leaderboards, we cannot calculate their exact Score Ratio (since one of the variables is
          unknown), but we can determine its minimum and maximum possible value. For these players,
          the minimum and maximum values are shown.
        </p>
        <br />
        <p>
          On the leaderboard, when sorting players by their Score Ratio, if a player's exact Score
          Ratio is unknown, the minimum value is taken into account for the purpose of sorting.
        </p>
      </Popover.Content>
    </Popover.Root>
  </div>
</div>
