<script lang="ts">
  import PlayerProfile from "$lib/components/player-profile/player-profile.svelte";
  import type { PageProps } from "./$types";
  import Loader2Icon from "@lucide/svelte/icons/loader-2";

  let { data }: PageProps = $props();
</script>

<div class="flex h-full w-full flex-col bg-secondary lg:p-8">
  {#await data.player}
    <div class="m-auto flex flex-col items-center justify-center gap-8 text-2xl">
      Loading player
      <Loader2Icon size={64} class="animate-spin" />
    </div>
  {:then player}
    {#if !player}
      Player is null!
    {:else}
      <PlayerProfile {player} />
    {/if}
  {:catch error}
    Error loading player: {error.message}
  {/await}
</div>
