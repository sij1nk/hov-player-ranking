<script lang="ts">
  import type { ComponentProps } from "svelte";
  import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { ColumnSort, SortingState } from "@tanstack/table-core";

  type Props = {
    id: string;
    name: string;
    sortingState: SortingState;
  };

  // FIXME: for some reason ComponentProps<typeof Button> is any...
  let {
    id,
    name,
    sortingState,
    variant = "ghost",
    ...restProps
  }: ComponentProps<typeof Button> & Props = $props();

  let sort: ColumnSort | undefined = $derived(sortingState[0]);
</script>

<Button {variant} {...restProps} class="h-fit flex-col text-lg lg:flex-row">
  {name}
  {#if sort?.id === id}
    {#if sort?.desc}
      <ArrowDownIcon class="ml-2" />
    {:else}
      <ArrowUpIcon class="ml-2" />
    {/if}
  {:else}
    <ArrowUpDownIcon class="ml-2 opacity-25" />
  {/if}
</Button>
