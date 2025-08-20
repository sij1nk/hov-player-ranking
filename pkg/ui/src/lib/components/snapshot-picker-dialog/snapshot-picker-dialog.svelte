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

  type Props = {
    currentSnapshot: Snapshot;
    snapshots: Snapshot[];
    snapshotCalendarDates: CalendarDate[];
  };

  let { currentSnapshot, snapshots, snapshotCalendarDates }: Props = $props();
  let isLatest = $derived(snapshots[0].id === currentSnapshot.id);

  let isOpen = $state(false);

  let currentCalendarDate = $derived<CalendarDate>(toCalendarDate(currentSnapshot.date));

  let matchingSnapshots = $derived(
    snapshots
      .filter((s) => equalsCalendarDate(s.date, currentCalendarDate))
      .sort((left, right) => left.date.valueOf() - right.date.valueOf()),
  );

  let selectSnapshot = (snapshot: Snapshot) => {
    isOpen = false;
    goto(snapshot.dateShort);
  };
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger class={buttonVariants({ variant: "ghost" })}>
    <div class="dialog-trigger">
      <span>{currentSnapshot.date.toLocaleString()}</span>
      {#if isLatest}
        <span>(latest)</span>
      {/if}
    </div>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Pick a leaderboard snapshot</Dialog.Title>
    </Dialog.Header>
    <Separator />
    <div class="dialog-content">
      <Calendar
        type="single"
        bind:value={currentCalendarDate}
        isDateDisabled={(date) => snapshotCalendarDates.every((s) => s.compare(date) !== 0)}
      />
      <ScrollArea class="h-120">
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
  .dialog-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dialog-content {
    display: flex;
    padding: 1em;
  }
</style>
