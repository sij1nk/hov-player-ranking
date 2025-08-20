<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import ChevronFirst from "@lucide/svelte/icons/chevron-first";
  import ChevronsLeft from "@lucide/svelte/icons/chevrons-left";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronsRight from "@lucide/svelte/icons/chevrons-right";
  import ChevronLast from "@lucide/svelte/icons/chevron-last";
  import type { PageProps } from "./$types";
  import type { Component } from "svelte";
  import { back, back24Hours, forward, forward24Hours, latest, oldest } from "./navigation";
  import { type Snapshot } from "$lib/types";
  import SnapshotPickerDialog from "$lib/components/snapshot-picker-dialog/snapshot-picker-dialog.svelte";
  import { columns, type LeaderboardEntry } from "$lib/components/leaderboard-table/columns";
  import LeaderboardTable from "$lib/components/leaderboard-table/leaderboard-table.svelte";

  type ButtonDescription = {
    id: string;
    Icon: Component;
    tooltip: string;
    hrefFn: (snapshot: Snapshot, snapshots: Snapshot[]) => Snapshot | null;
  };

  const buttons: ButtonDescription[] = [
    {
      id: "oldest",
      Icon: ChevronFirst,
      tooltip: "Go to oldest",
      hrefFn: oldest,
    },
    {
      id: "back-one-day",
      Icon: ChevronsLeft,
      tooltip: "Go back by 24 hours",
      hrefFn: back24Hours,
    },
    {
      id: "back",
      Icon: ChevronLeft,
      tooltip: "Go back",
      hrefFn: back,
    },
    {
      id: "forward",
      Icon: ChevronRight,
      tooltip: "Go forward",
      hrefFn: forward,
    },
    {
      id: "forward-one-day",
      Icon: ChevronsRight,
      tooltip: "Go forward by 24 hours",
      hrefFn: forward24Hours,
    },
    {
      id: "latest",
      Icon: ChevronLast,
      tooltip: "Go to latest",
      hrefFn: latest,
    },
  ];

  // NOTE: `data.snapshots` is ordered by `dateShort` desc
  let { data }: PageProps = $props();
</script>

{#snippet navigationButton(button)}
  {@const snapshot = button.hrefFn(data.snapshot, data.snapshots)}
  <Button
    disabled={snapshot === null}
    href={snapshot ? snapshot.dateShort : undefined}
    title={button.tooltip}
  >
    <button.Icon />
  </Button>
{/snippet}

<header>
  {#each buttons.slice(0, 3) as button (button.id)}
    {@render navigationButton(button)}
  {/each}
  <SnapshotPickerDialog
    currentSnapshot={data.snapshot}
    snapshots={data.snapshots}
    snapshotCalendarDates={data.snapshotCalendarDates}
  />
  {#each buttons.slice(3) as button (button.id)}
    {@render navigationButton(button)}
  {/each}
</header>

{#await data.leaderboard}
  Loading leaderboard...
{:then leaderboard}
  {@const entries: LeaderboardEntry[] = leaderboard.map(l => ({
    name: l.player.name,
    pvpRank: l.pvpRank ?? undefined,
    pvpScore: l.pvpScore ?? undefined,
    totalRank: l.totalRank ?? undefined,
    totalScore: l.totalScore ?? undefined,
    scoreRatioMin: l.scoreRatioMin,
    scoreRatioMax: l.scoreRatioMax
  }))}
  <LeaderboardTable data={entries} {columns} />
{:catch error}
  Error loading leaderdboard: {error.message}
{/await}

<style>
  header {
    display: flex;
    gap: 16px;
  }
</style>
