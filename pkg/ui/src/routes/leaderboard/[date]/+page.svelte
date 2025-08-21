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
  import { columns, toLeaderboardEntry } from "$lib/components/leaderboard-table/columns";
  import LeaderboardTable from "$lib/components/leaderboard-table/leaderboard-table.svelte";
  import Loader2Icon from "@lucide/svelte/icons/loader-2";

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
      tooltip: "To oldest snapshot",
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
      tooltip: "To previous snapshot",
      hrefFn: back,
    },
    {
      id: "forward",
      Icon: ChevronRight,
      tooltip: "To next snapshot",
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
      tooltip: "To latest snapshot",
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
    variant="default"
    size="icon"
  >
    <button.Icon />
  </Button>
{/snippet}

<div class="flex h-full w-full flex-col bg-secondary lg:px-4">
  <nav class="grid grid-cols-2 grid-rows-2 gap-4 gap-y-8 py-8 lg:grid-cols-11 lg:grid-rows-1">
    <div class="col-1 row-2 flex justify-end gap-4 lg:col-span-4 lg:row-1">
      {#each buttons.slice(0, 3) as button (button.id)}
        {@render navigationButton(button)}
      {/each}
    </div>
    <SnapshotPickerDialog
      currentSnapshot={data.snapshot}
      snapshots={data.snapshots}
      snapshotCalendarDates={data.snapshotCalendarDates}
      class="col-span-full row-1 lg:col-span-3"
    />
    <div class="col-2 row-2 flex gap-4 lg:col-span-4 lg:row-1">
      {#each buttons.slice(3) as button (button.id)}
        {@render navigationButton(button)}
      {/each}
    </div>
  </nav>

  {#await data.leaderboard}
    <div class="m-auto flex flex-col items-center justify-center gap-8 text-2xl">
      Loading leaderboard
      <Loader2Icon size={64} class="animate-spin" />
    </div>
  {:then leaderboard}
    <LeaderboardTable
      data={leaderboard.map(toLeaderboardEntry)}
      {columns}
      class="min-h-0 grow lg:mb-6"
    />
  {:catch error}
    Error loading leaderdboard: {error.message}
  {/await}
</div>
