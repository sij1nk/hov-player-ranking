<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import type { Snapshot } from "$lib/types";
  import Separator from "../ui/separator/separator.svelte";
  import Calendar from "../ui/calendar/calendar.svelte";
  import { CalendarDate } from "@internationalized/date";
  import { equalsCalendarDate, toCalendarDate } from "$lib/date";
  import Button from "../ui/button/button.svelte";
  import Table2 from "@lucide/svelte/icons/table-2";
  import ScrollArea from "../ui/scroll-area/scroll-area.svelte";
  import { goto } from "$app/navigation";
  import { buttonVariants } from "../ui/button";
  import { cn } from "$lib/utils";
  import type { ClassValue } from "clsx";

  type Props = {
    currentSnapshot: Snapshot;
    snapshots: Snapshot[];
    snapshotCalendarDates: CalendarDate[];
    class?: ClassValue;
  };

  let { class: className, currentSnapshot, snapshots, snapshotCalendarDates }: Props = $props();
  let isOldest = $derived(snapshots.at(-1)!.id === currentSnapshot.id);
  let isLatest = $derived(snapshots[0].id === currentSnapshot.id);

  let isOpen = $state(false);

  let currentCalendarDate = $derived<CalendarDate>(toCalendarDate(currentSnapshot.date));

  let matchingSnapshots = $derived(
    snapshots
      .filter((s) => equalsCalendarDate(s.date, currentCalendarDate))
      .sort((left, right) => left.date.valueOf() - right.date.valueOf()), // sort by date asc
  );

  let selectSnapshot = (snapshot: Snapshot) => {
    isOpen = false;
    goto(snapshot.dateShort);
  };
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger
    title="Pick a specific leaderboard snapshot"
    class={cn(buttonVariants({ variant: "ghost" }), "cursor-pointer", className)}
  >
    <div class="relative flex w-40 flex-col items-center px-2 md:w-50 lg:w-60">
      <span class="text-2xl">{currentSnapshot.date.toLocaleString()}</span>
      {#if isLatest}
        <span class="text-md absolute top-8 opacity-50">(latest)</span>
      {:else if isOldest}
        <span class="text-md absolute top-8 opacity-50">(oldest)</span>
      {/if}
    </div>
  </Dialog.Trigger>
  <Dialog.Content class="">
    <Dialog.Header>
      <Dialog.Title>Pick a leaderboard snapshot</Dialog.Title>
    </Dialog.Header>
    <Separator />
    <div class="flex flex-col items-start justify-center gap-2 px-2 md:h-80 md:flex-row">
      <Calendar
        class="mx-auto"
        type="single"
        bind:value={currentCalendarDate}
        isDateDisabled={(date) => snapshotCalendarDates.every((s) => s.compare(date) !== 0)}
      />
      <ScrollArea class="mx-auto h-40 md:h-80" type="always">
        <ul>
          {#each matchingSnapshots as matchingSnapshot (matchingSnapshot.id)}
            <li>
              <Button
                href={matchingSnapshot.dateShort}
                variant="ghost"
                onclick={() => selectSnapshot(matchingSnapshot)}
              >
                <Table2 />
                {matchingSnapshot.date.toLocaleString()}</Button
              >
            </li>
          {/each}
        </ul></ScrollArea
      >
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
</style>
