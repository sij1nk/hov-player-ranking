<script lang="ts">
  import type { PlayerStats } from "./player";
  import * as Table from "$lib/components/ui/table/index.js";
  import CircleHelp from "@lucide/svelte/icons/circle-help";
  import * as Popover from "$lib/components/ui/popover/index.js";

  type Props = {
    stats: PlayerStats;
  };

  let { stats }: Props = $props();

  let rowClass = "text-md border-none bg-secondary flex flex-row items-center";
</script>

{#snippet row(title: string, score: number | null, rank: number | null)}
  <Table.Row class={rowClass}>
    <Table.Cell class="px-0 opacity-75">{title}</Table.Cell>
    <Table.Cell class="text-lg">
      {score?.toLocaleString() ?? "unknown"}
      {#if rank}
        <span class="text-sm opacity-50">{`(#${rank})`}</span>
      {/if}
    </Table.Cell>
  </Table.Row>
{/snippet}

<Table.Root>
  <Table.Body>
    {@render row("PvP Score", stats.pvpScore, stats.pvpRank)}
    {@render row("Total Score", stats.totalScore, stats.totalRank)}
    <Table.Row class={rowClass}>
      <Table.Cell class="px-0 opacity-75">Score Ratio</Table.Cell>
      {#if stats.scoreRatioMin === stats.scoreRatioMax}
        <Table.Cell class="text-lg">{stats.scoreRatioMin.toFixed(3)}</Table.Cell>
      {:else}
        <Table.Cell class="text-lg">
          {stats.scoreRatioMin.toFixed(3)} <span class="text-md opacity-50">-</span>
          {stats.scoreRatioMax.toFixed(3)}</Table.Cell
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
            A higher number indicates that the player mostly plays against other players; a low
            number means the player primarily plays against bots, or gains score from other non-PvP
            sources (e.g. hosting servers).
          </p>
          <br />
          <p>
            The official leaderboards only show 200 entries each. For players who are not on both
            leaderboards, we cannot calculate their exact Score Ratio (since one of the variables is
            unknown), but we can determine its minimum and maximum possible value. For these
            players, the minimum and maximum values are shown.
          </p>
          <br />
          <p>
            On the leaderboard, when sorting players by their Score Ratio, if a player's exact Score
            Ratio is unknown, the minimum value is taken into account for the purpose of sorting.
          </p>
        </Popover.Content>
      </Popover.Root>
    </Table.Row>
  </Table.Body>
</Table.Root>
