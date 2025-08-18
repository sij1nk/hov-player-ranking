<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import type { Snapshot } from "$lib/types";
  import Separator from "../ui/separator/separator.svelte";
  import Calendar from "../ui/calendar/calendar.svelte";
  import { CalendarDate } from "@internationalized/date";
  import { toCalendarDate } from "$lib/date";

  type Props = {
    currentSnapshot: Snapshot;
    snapshots: Snapshot[];
    snapshotCalendarDates: CalendarDate[];
  };

  let { currentSnapshot, snapshots, snapshotCalendarDates }: Props = $props();
  let isLatest = $derived(snapshots[0].id === currentSnapshot.id);

  let currentCalendarDate = $state<CalendarDate>(toCalendarDate(currentSnapshot.date));
</script>

<Dialog.Root>
  <Dialog.Trigger>
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
      <Separator />
      <Calendar
        type="single"
        bind:value={currentCalendarDate}
        isDateDisabled={(date) => snapshotCalendarDates.every((s) => s.compare(date) !== 0)}
      />
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

<style>
  .dialog-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
