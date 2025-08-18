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
  import {
    back,
    back24Hours,
    forward,
    forward24Hours,
    latest,
    oldest,
    type Snapshot,
  } from "./navigation";

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
  {data.snapshot.date.toLocaleString()}
  {#each buttons.slice(3) as button (button.id)}
    {@render navigationButton(button)}
  {/each}
</header>

<style>
  header {
    display: flex;
    gap: 16px;
  }
</style>
